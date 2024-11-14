"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const axios_1 = __importDefault(require("axios"));
const node_cache_1 = __importDefault(require("node-cache"));
// Create an Axios instance to set default parameters and improve manageability
const axiosInstance = axios_1.default.create({
    baseURL: "https://api.skinport.com/v1/items",
    params: { app_id: 730, currency: "EUR" },
    timeout: 20000, // example of setting a longer timeout if needed
});
const router = express_1.default.Router();
const cache = new node_cache_1.default({ stdTTL: 600 });
router.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const cacheKey = "skinport_items";
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
        return res.json(cachedData);
    }
    try {
        const responses = yield Promise.all([
            axiosInstance.get("", { params: { tradable: 1 } }),
            axiosInstance.get("", { params: { tradable: 0 } }),
        ]);
        const itemsMap = {};
        responses.forEach((response, index) => {
            const isTradable = index === 0;
            response.data.forEach((item) => {
                const existingItem = itemsMap[item.market_hash_name];
                if (existingItem) {
                    if (isTradable) {
                        existingItem.tradable_min_price = item.min_price;
                    }
                    else {
                        existingItem.non_tradable_min_price = item.min_price;
                    }
                }
                else {
                    itemsMap[item.market_hash_name] = Object.assign(Object.assign({}, item), { tradable_min_price: isTradable ? item.min_price : null, non_tradable_min_price: !isTradable ? item.min_price : null });
                }
            });
        });
        const result = Object.values(itemsMap);
        cache.set(cacheKey, result);
        res.json(result);
    }
    catch (error) {
        console.error("Error fetching data from Skinport:", error.message);
        res
            .status(500)
            .json({ message: "Error fetching items", error: error.message });
    }
}));
router.get("/cached-items", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        //const items = cache.get<Item[]>("skinport_items");
        const items = cache.get("skinport_items");
        if (!items) {
            // If there are no items in the cache, handle accordingly
            return res.status(404).send("No items found in cache.");
        }
        // If items are found in the cache, return them
        res.json(items);
    }
    catch (error) {
        console.log(error);
        res.status(500).send("Failed to retrieve items from cache");
    }
}));
exports.default = router;
