import {
    FaBook,
    FaBoxOpen,
    FaGlasses,
    FaHeadphones,
    FaIdCard,
    FaShoppingBag,
    FaTshirt,
} from "react-icons/fa";

export const categories = {
    electronics: {
        label: "Electronics",
        color: "#5065a7",
        icon: FaHeadphones,
    },
    buzzcard: {
        label: "BuzzCards/Wallets",
        color: "#c29106",
        icon: FaIdCard,
    },
    bags: {
        label: "Bags/Backpacks",
        color: "#3a872b",
        icon: FaShoppingBag,
    },
    clothing: {
        label: "Clothing/Accessories",
        color: "#8e6bbb",
        icon: FaTshirt,
    },
    books: {
        label: "Books/School",
        color: "#d54f54",
        icon: FaBook,
    },
    personal: {
        label: "Personal Items",
        color: "#3eaaa1",
        icon: FaGlasses,
    },
    misc: {
        label: "Miscellaneous",
        color: "#8f5d5d",
        icon: FaBoxOpen,
    },
};

export const CATEGORY_KEYS = Object.keys(categories) as Array<
    keyof typeof categories
>;
