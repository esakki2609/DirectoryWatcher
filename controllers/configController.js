import prisma from "../services/prisma.js";
import fs from "fs";
import path from "path";

const ConfigController = {
  getAllDirectory: async (req, res) => {
    const config = await prisma.configuration.findMany();
    if (config) res.json(config);
    else
      res.status(404).json("No Directory Found.Please create a New Directory");
  },

  getDirectory: async (req, res) => {
    const id = parseInt(req.params.id);
    console.log(id);
    const config = await prisma.configuration.findFirst({
      where: { id: id },
    });
    if (config) res.json(config);
    else res.json({ message: "Directory was not found" });
  },

  createDirectory: async (req, res) => {
    const { directory, interval, magicString } = req.body;
    // Check if configuration already exists
    if (!directory) res.json({ message: "Please provide directory name" });
    else if (!interval) res.json({ message: "Please provide interval time" });
    else if (!magicString)
      res.json({ message: "Please provide magicString time" });
    else {
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
    }
  },

  updateDirectory: async (req, res) => {
    const { directory, interval, magicString, id } = req.body;

    const getDirectory = await prisma.configuration.findFirst({
      where: {
        id: id,
      },
    });
    if (getDirectory) {
      const config = await prisma.configuration.update({
        where: { id: id },
        data: { directory, interval, magicString },
      });
      res.json(config);
    } else {
      res.json({ message: "Directory was not found" });
    }
  },

  createFile: async (req, res) => {
    const { fileName } = req.body;
    const configurationId = parseInt(req.params.dirId);
    try {
      // Find the configuration to get the directory path
      const config = await prisma.configuration.findFirst({
        where: { id: configurationId },
      });

      if (!config) {
        return res.status(404).json({ message: "Directory not found" });
      }

      // Create the directory if it does not exist
      if (!fs.existsSync(config.directory)) {
        fs.mkdirSync(config.directory, { recursive: true });
      }

      // Check how many files are currently in the directory
      const filesInDirectory = fs.readdirSync(config.directory);
      const currentFileCount = filesInDirectory.length;

      // Create an entry in the fileAdded table
      const createdFiles = await prisma.fileAdded.create({
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
        createdFiles,
        updatedConfig,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "An error occurred", error });
    }
  },

  deleteFile: async (req, res) => {
    const fileId = parseInt(req.params.id);
    const configId = parseInt(req.params.dirId);

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
  },
};
export default ConfigController;
