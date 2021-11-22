const client = require('./db.js');

const databaseDefinition = { id: 'stocksdb' };
const collectionDefinition = { id: 'stocks' };

const init = async () => {
  const { database } = await client.databases.createIfNotExists(
    databaseDefinition,
  );
  const { container } = await database.containers.createIfNotExists(
    collectionDefinition,
  );
  return { database, container };
};

const getPriceChange = () => {
  const min = 100;
  const max = 999;
  const change = min + Math.random() * (max - min);
  const value = Math.round(change);
  return parseFloat((parseFloat(value) / 100).toFixed(2));
};

const getStockChangeValues = (existingStock) => {
  const isChangePositive = !(existingStock.changeDirection === '+');
  const change = getPriceChange();
  let price = isChangePositive
    ? existingStock.price + change
    : existingStock.price - change;
  price = parseFloat(parseFloat(price).toFixed(2));
  return {
    price: price,
    change: change,
    changeDirection: isChangePositive ? '+' : '-',
  };
};

const updateData = async () => {
  const { container } = await init();

  console.log('Read data from database.\n\n');

  const ids = [
    'e0eb6e85-176d-4ce6-89ae-1f699aaa0bab',
    'ebe2e863-bf84-439a-89f8-39975e7d6766',
    '80bc1751-3831-4749-99ea-5c6a63105ae7',
  ];
  let updatedIndexes = [];
  for (let i = 0; i < ids.length; i++) {
    const shouldUpdate = Math.random() < 0.5;
    if (shouldUpdate) {
      let id = ids[i];
      updatedIndexes.push(i);
      const doc = await container.item(id);

      const { body: existingStock } = await doc.read();

      const updates = getStockChangeValues(existingStock);

      Object.assign(existingStock, updates);

      await doc.replace(existingStock);

      console.log(`Data updated: ${JSON.stringify(existingStock)}`);
      console.log('');
    }
    if (i + 1 === ids.length) {
      let updatedIndexesCommaSeparatedList = '';
      updatedIndexes.forEach((updatedIndex) => {
        if (updatedIndexesCommaSeparatedList === '') {
          updatedIndexesCommaSeparatedList += updatedIndex + 1;
        } else {
          updatedIndexesCommaSeparatedList += `, ${updatedIndex + 1}`;
        }
      });
      let updatedIndexesString = 'no stock items were updated';
      if (updatedIndexes.length > 0) {
        updatedIndexesString = `following stock items were updated: ${updatedIndexesCommaSeparatedList}`;
      }
      console.log(updatedIndexesString);
    }
  }
};

updateData().catch((err) => {
  console.error(err);
});
