import prisma from "../services/prisma.js";
import fs from "fs";
import path from "path";

const intervals = new Map();
// Controller functions

const TaskController = {
  startTask: async (req, res) => {
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
          magicStringCount += (
            content.match(new RegExp(magicString, "g")) || []
          ).length;
        }

        // Schedule the task to run at the specified interval
        const intervalId = setInterval(() => {
          console.log(`Task scheduled to run every ${interval} seconds`);
        }, interval);

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
  },

  stopTask: async (req, res) => {
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
        const seconds = Math.floor(
          (runtimeInMilliseconds % (1000 * 60)) / 1000
        );

        await prisma.$transaction(async (prisma) => {
          taskDetails = await prisma.taskRun.update({
            where: {
              id: getTaskRunDetails.id,
            },
            data: {
              startTime: new Date(),
              endTime: endTime,
              runtime: `${hours}h ${minutes}m ${seconds}s`,
              status: "SUCCESS",
              configurationId: id,
            },
          });
        });
      }

      res.json({
        message: `Task with ID ${id} stopped`,
        taskDetails: taskDetails,
      });
    } else {
      res.status(404).json({ message: "No running task found with this ID" });
    }
  },

  getTaskDetails: async (req, res) => {
    const id = parseInt(req.params.id);
    const getFiles = await prisma.taskRun.findFirst({
      where: {
        configurationId: id,
      },
    });
    if (getFiles) res.json(getFiles);
    else res.status(404).json({ message: "No Directory found with this ID" });
  },
};
export default TaskController;
