// Assuming dataTradable1 is the data for tradable=1
// and dataTradable0 is the data for tradable=0

const dataTradable1 = dataNonTradable;
const dataTradable0 = [
  /* array of items from tradable=0 */
];

// Function to compare the two datasets
const compareDatasets = (data1, data2) => {
  const differences = [];

  data1.forEach((item1, index) => {
    const item2 = data2[index];

    if (item1.market_hash_name !== item2.market_hash_name) {
      differences.push({
        index,
        key: "market_hash_name",
        value1: item1.market_hash_name,
        value2: item2.market_hash_name,
      });
    }

    // Compare other properties here
    Object.keys(item1).forEach((key) => {
      if (item1[key] !== item2[key]) {
        differences.push({
          index,
          key,
          value1: item1[key],
          value2: item2[key],
        });
      }
    });
  });

  return differences;
};

const differences = compareDatasets(dataTradable1, dataTradable0);

if (differences.length > 0) {
  console.log("Differences found:", differences);
} else {
  console.log("No differences found between the datasets.");
}
