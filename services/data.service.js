const { default: mongoose } = require("mongoose");
const { dataSchema } = require("../model");
const { WebSocketServer } = require("ws");
const wss = new WebSocketServer({ noServer: true });
// Function to get all list

const getAllData = async () => {
  try {
    const doc = await dataSchema.findOne();
    return { data: doc.data };
  } catch (error) {
    console.error("Error fetching data:", error);
    return { success: false, message: "Failed to fetch data.", error };
  }
};

const addData = async (updatedStatus, prevStatus, itemId, newIndex) => {
  try {
    const doc = await dataSchema.findOne();
    if (!doc) {
      throw new Error("Document not found.");
    }

    // Get the source and destination arrays
    const sourceArray = doc.data[prevStatus];
    const destinationArray = doc.data[updatedStatus];

    if (!sourceArray || !destinationArray) {
      throw new Error(
        `Couldn't find data arrays for statuses ${prevStatus} or ${updatedStatus}`
      );
    }

    // Find the item index in the source array
    const itemIndex = sourceArray.findIndex(
      (item) => item.id.toString() === itemId
    );
    if (itemIndex === -1) {
      throw new Error(
        `Item with id ${itemId} not found in ${prevStatus} array.`
      );
    }

    // Remove the item from the source array
    const [movedItem] = sourceArray.splice(itemIndex, 1);

    // Calculate the valid index in the destination array based on the new position
    const targetIndex = Math.min(
      Math.max(newIndex, 0),
      destinationArray.length
    );

    // Insert the item at the calculated index in the destination array
    destinationArray.splice(targetIndex, 0, movedItem);

    // Mark the data as modified for both arrays
    doc.markModified(`data.${prevStatus}`);
    doc.markModified(`data.${updatedStatus}`);
    await doc.save();

    return {
      success: true,
      message: "Item moved successfully and updated in the new column.",
      data: doc,
    };
  } catch (error) {
    throw new Error(`Error updating item: ${error.message}`);
  }
};

const updateIndex = async (body) => {
  try {
    const { sourceIndex, destinationIndex, status } = body;

    const dataDocument = await dataSchema.findOne();
    if (!dataDocument) {
      throw new Error("No data document found for item status update request ");
    }

    const itemsArray = dataDocument.data[status];
    if (!itemsArray) {
      throw new Error("  Couldn't find data document for status " + status);
    }

    if (
      sourceIndex < 0 ||
      destinationIndex < 0 ||
      sourceIndex >= itemsArray.length ||
      destinationIndex >= itemsArray.length
    ) {
      throw new Error(" Couldn't find source index ");
    }

    const reorderedItems = [...itemsArray];
    const [movedItem] = reorderedItems.splice(sourceIndex, 1);
    reorderedItems.splice(destinationIndex, 0, movedItem);

    dataDocument.data[status] = reorderedItems;
    dataDocument.markModified(`data.${status}`);
    await dataDocument.save();
    return dataDocument.data[status];
  } catch (error) {
    throw new Error(`Error updating data at index: ${error.message}`);
  }
};

const addNewColumn = async (columnName) => {
  try {
    // Try to find an existing document
    let dataDocument = await dataSchema.findOne();

    // If no document exists, create a new one with default columns and the new column
    if (!dataDocument) {
      dataDocument = new dataSchema({
        data: {
          [columnName]: [],
          todo: [],
          doing: [],
          done: [],
        },
      });
      await dataDocument.save();
      return dataDocument.data;
    }

    // Check if the column already exists
    if (dataDocument.data[columnName]) {
      throw new Error(`Column with name "${columnName}" already exists.`);
    }

    // Add the new column to the existing document
    dataDocument.data[columnName] = [];
    dataDocument.markModified("data");
    await dataDocument.save();

    return dataDocument.data;
  } catch (error) {
    throw new Error(`Error adding new column: ${error.message}`);
  }
};

const addNewCard = async (body) => {
  try {
    const { status } = body;
    const columnData = {
      id: new mongoose.Types.ObjectId(),
      title: body.title,
      description: body.description,
      dueDate: body.dueDate,
    };
    const dataDocument = await dataSchema.findOne();
    if (!dataDocument) {
      throw new Error("No data document found for adding new card.");
    }
    const column = dataDocument.data[status];
    if (!column) {
      throw new Error(`No column found with id "${status}".`);
    }
    column.push(columnData);
    dataDocument.markModified(`data.${status}`);
    await dataDocument.save();
    return dataDocument.data[status];
  } catch (error) {
    throw new Error(`Error adding new card: ${error.message}`);
  }
};

module.exports = {
  addData,
  getAllData,
  updateIndex,
  addNewColumn,
  addNewCard,
};
