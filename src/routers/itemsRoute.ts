import express, { Request, Response } from "express";
import axios from "axios";
import NodeCache from "node-cache";

// Create an Axios instance to set default parameters and improve manageability
const axiosInstance = axios.create({
  baseURL: "https://api.skinport.com/v1/items",
  params: { app_id: 730, currency: "EUR" },
  timeout: 20000, // example of setting a longer timeout if needed
});

const router = express.Router();
const cache = new NodeCache({ stdTTL: 600 });

interface Item {
  market_hash_name: string;
  currency: string;
  tradable_min_price?: number | null;
  non_tradable_min_price?: number | null;
  suggested_price: number;
  item_page: string;
  market_page: string;
  min_price: number | null;
  max_price: number | null;
  mean_price: number | null;
  median_price: number | null;
  quantity: number;
  created_at: number;
  updated_at: number;
}

router.get("/", async (req: Request, res: Response) => {
  const cacheKey = "skinport_items";
  const cachedData: Item[] | undefined = cache.get<Item[]>(cacheKey);

  if (cachedData) {
    return res.json(cachedData);
  }

  try {
    const responses = await Promise.all([
      axiosInstance.get("", { params: { tradable: 1 } }),
      axiosInstance.get("", { params: { tradable: 0 } }),
    ]);

    const itemsMap: { [key: string]: Item } = {};

    responses.forEach((response, index) => {
      const isTradable = index === 0;
      response.data.forEach((item: Item) => {
        const existingItem: Item = itemsMap[item.market_hash_name];
        if (existingItem) {
          if (isTradable) {
            existingItem.tradable_min_price = item.min_price;
          } else {
            existingItem.non_tradable_min_price = item.min_price;
          }
        } else {
          itemsMap[item.market_hash_name] = {
            ...item,
            tradable_min_price: isTradable ? item.min_price : null,
            non_tradable_min_price: !isTradable ? item.min_price : null,
          };
        }
      });
    });

    const result = Object.values(itemsMap);
    cache.set(cacheKey, result);
    res.json(result);
  } catch (error: any) {
    console.error("Error fetching data from Skinport:", error.message);
    res
      .status(500)
      .json({ message: "Error fetching items", error: error.message });
  }
});

router.get("/cached-items", async (req, res) => {
  try {
    //const items = cache.get<Item[]>("skinport_items");
    const items = cache.get("skinport_items");

    if (!items) {
      // If there are no items in the cache, handle accordingly
      return res.status(404).send("No items found in cache.");
    }
    // If items are found in the cache, return them
    res.json(items);
  } catch (error) {
    console.log(error);
    res.status(500).send("Failed to retrieve items from cache");
  }
});

export default router;
