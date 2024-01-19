import Item from "./item.model"

interface Receipt{
    retailer: String;
    purchaseDate: String;
    purchaseTime: String;
    items: Array<Item>;
    total: String;
}

export default Receipt