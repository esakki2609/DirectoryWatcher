const express = require("express");
const { PrismaClient } = require("@prisma/client");
const bodyParser = require("body-parser");

// import taskRunner from "./taskRunner";

const prisma = new PrismaClient();
const app = express();
app.use(bodyParser.json());
const fs = require("fs");
const path = require("path");
const intervals = new Map();

// Schedule task based on interval configuration
app.get("/startTask/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  let magicStringCount = 0;
  let taskDetails;

  const getConfig = await prisma.configuration.findFirst({
    where: { id: id },
    select: {
      directory: true,
      interval: true,
      magicString: true,
      filesAdded: true,
    },
  });

  if (getConfig) {
    const { directory, interval, magicString } = getConfig;

    try {
      const files = await fs.promises.readdir(directory);

      for (const file of files) {
        const filePath = path.join(directory, file);
        const content = await fs.promises.readFile(filePath, "utf-8");
        magicStringCount += (content.match(new RegExp(magicString, "g")) || [])
          .length;
      }

      // Schedule the task to run at the specified interval
      const intervalId = setInterval(() => {
        console.log(`Task scheduled to run every ${interval} seconds`);
        // Replace this log with the actual task logic
      }, interval * 1000); // interval is in seconds, convert to milliseconds

      // Store the interval ID with the configuration ID as the key
      intervals.set(id, intervalId);

      console.log(
        `Started task with ID ${id}, running every ${interval} seconds`
      );
      const getTaskRunDetails = await prisma.taskRun.findFirst({
        where: {
          configurationId: id,
        },
      });
      if (getTaskRunDetails) {
        await prisma.$transaction(async (prisma) => {
          taskDetails = await prisma.taskRun.update({
            where: {
              id: getTaskRunDetails.id,
            },
            data: {
              startTime: new Date(),
              magicStringCount: magicStringCount,
              status: "SUCCESS",
              configurationId: id,
            },
          });
          console.log("endupdateTask", taskDetails);
        });
      } else {
        taskDetails = await prisma.taskRun.create({
          data: {
            startTime: new Date(),
            magicStringCount: magicStringCount,
            status: "SUCCESS",
            configurationId: id,
          },
        });
        console.log("createTaskRun", taskDetails);
      }
      // Send response with the configuration and magic string count
      res.json({
        message: `Task started`,
        config: getConfig,
        magicString: magicString,
        magicStringCount: magicStringCount,
        taskDetails: taskDetails,
      });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error processing files", error: error.message });
    }
  } else {
    res.status(404).json({ message: "Configuration not found" });
  }
});

// Endpoint to get task run details
app.get("/taskDetails/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  console.log(id);
  const getFiles = await prisma.taskRun.findFirst({
    where: {
      configurationId: id,
    },
  });

  res.json(getFiles);
});

// Endpoint to create configuration
app.post("/config", async (req, res) => {
  const { directory, interval, magicString } = req.body;

  // Check if configuration already exists
  const existingConfig = await prisma.configuration.findFirst({
    where: { directory: directory },
  });

  if (existingConfig) {
    return res
      .status(400)
      .json({ message: "Configuration already exists.", existingConfig });
  } else {
    // Create the directory if it does not exist
    fs.mkdirSync(directory, { recursive: true });
  }

  const config = await prisma.configuration.create({
    data: { directory, interval, magicString },
  });

  res.json(config);
});

// Endpoint to update configuration
app.put("/config/update", async (req, res) => {
  const { directory, interval, magicString, id } = req.body;
  const config = await prisma.configuration.update({
    where: { id: id },
    data: { directory, interval, magicString },
  });
  res.json(config);
});

// Endpoint to get configuration
app.get("/config", async (req, res) => {
  const config = await prisma.configuration.findMany();
  res.json(config);
});

app.get("/config/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  console.log(id);
  const config = await prisma.configuration.findFirst({
    where: { id: id },
    select: {
      directory: true,
      filesAdded: true,
      magicString: true,
      interval: true,
    },
  });
  console.log("configId", config);
  res.json(config);
});

// Endpoint to stop a task
app.get("/stopTask/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  let taskDetails;

  if (intervals.has(id)) {
    clearInterval(intervals.get(id));
    intervals.delete(id);

    console.log(`Stopped task with ID ${id}`);

    const getTaskRunDetails = await prisma.taskRun.findFirst({
      where: {
        configurationId: id,
      },
    });

    if (getTaskRunDetails) {
      const startTime = getTaskRunDetails.startTime;
      const endTime = new Date();
      const runtimeInMilliseconds = endTime - startTime;

      // Calculate hours, minutes, and seconds
      const hours = Math.floor(runtimeInMilliseconds / (1000 * 60 * 60));
      const minutes = Math.floor(
        (runtimeInMilliseconds % (1000 * 60 * 60)) / (1000 * 60)
      );
      const seconds = Math.floor((runtimeInMilliseconds % (1000 * 60)) / 1000);

      await prisma.$transaction(async (prisma) => {
        taskDetails = await prisma.taskRun.update({
          where: {
            id: getTaskRunDetails.id,
          },
          data: {
            startTime: new Date(),
            endTime: endTime,
            runtime: `${hours}h ${minutes}m ${seconds}s`, // Format runtime
            status: "SUCCESS",
            configurationId: id,
          },
        });
        console.log("updateTask", taskDetails);
      });
    }

    res.json({
      message: `Task with ID ${id} stopped`,
      taskDetails: taskDetails,
    });
  } else {
    res.status(404).json({ message: "No running task found with this ID" });
  }
});

//Add files..

// Endpoint to add a file and create it in the filesystem
app.post("/config/createFiles", async (req, res) => {
  const { fileName, configurationId } = req.body;

  try {
    // Find the configuration to get the directory path
    const config = await prisma.configuration.findFirst({
      where: { id: configurationId },
    });

    if (!config) {
      return res.status(404).json({ message: "Configuration not found" });
    }

    // Create the directory if it does not exist
    if (!fs.existsSync(config.directory)) {
      fs.mkdirSync(config.directory, { recursive: true });
    }

    // Check how many files are currently in the directory
    const filesInDirectory = fs.readdirSync(config.directory);
    const currentFileCount = filesInDirectory.length;

    // Create an entry in the fileAdded table
    const createFiles = await prisma.fileAdded.create({
      data: {
        fileName: fileName,
        configurationId: configurationId,
      },
    });

    // Create the file in the specified directory
    const filePath = path.join(config.directory, fileName);
    fs.writeFileSync(filePath, "");

    // Update the file count in the configuration
    const updatedConfig = await prisma.configuration.update({
      where: { id: configurationId },
      data: {
        files_add_count: currentFileCount + 1,
      },
    });

    res.json({
      message: "File created and added to the database",
      createFiles,
      updatedConfig,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "An error occurred", error });
  }
});

app.delete("/config/:configId/deleteFile/:id", async (req, res) => {
  const fileId = parseInt(req.params.id);
  const configId = parseInt(req.params.configId);

  try {
    // Find the file entry to get the file name and configuration ID
    const fileEntry = await prisma.fileAdded.findUnique({
      where: { id: fileId },
    });

    if (!fileEntry) {
      return res.status(404).json({ message: "File entry not found" });
    }

    // Find the configuration to get the directory path
    const config = await prisma.configuration.findFirst({
      where: { id: configId },
    });

    if (!config) {
      return res.status(404).json({ message: "Configuration not found" });
    }

    // Construct the file path
    const filePath = path.join(config.directory, fileEntry.fileName);

    // Check if the file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "File not found" });
    }

    // Delete the file
    fs.unlinkSync(filePath);

    // Delete the file entry from the database
    await prisma.fileAdded.delete({
      where: { id: fileId },
    });

    // Get the previous file count from the configuration
    const previousDeleteCount = config.files_delete_count || 0;

    // Update the file count in the configuration by subtracting the deleted file count
    const updatedConfig = await prisma.configuration.update({
      where: { id: config.id },
      data: {
        files_delete_count: previousDeleteCount + 1,
      },
    });

    res.json({
      message: `File ${fileEntry.fileName} deleted and file count updated`,
      updatedConfig,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "An error occurred", error });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
