const foodEmojiMap: { [key: string]: string } = {
    // Meats & Proteins
    'beef': '🥩',
    'chicken': '🍗',
    'turkey': '🦃',
    'pork': '🥓',
    'lamb': '🐑',
    'veal': '🥩',
    'duck': '🦆',
    'goose': '🦆',
    'bacon': '🥓',
    'sausage': '🌭',
    'ham': '🍖',
    'meat': '🍖',

    // Fish & Seafood
    'fish': '🐟',
    'salmon': '🍣',
    'tuna': '🐟',
    'cod': '🐟',
    'sardines': '🐟',
    'mackerel': '🐟',
    'halibut': '🐟',
    'trout': '🐟',
    'bass': '🐟',
    'haddock': '🐟',
    'pollock': '🐟',
    'anchovies': '🐟',
    'herring': '🐟',
    'flounder': '🐟',
    'sole': '🐟',
    'shrimp': '🦐',
    'crab': '🦀',
    'lobster': '🦞',
    'scallops': '🐚',
    'mussels': '🦪',
    'oysters': '🦪',
    'clams': '🐚',
    'squid': '🦑',
    'octopus': '🐙',
    'crustaceans': '🦀',

    // Dairy & Eggs
    'eggs': '🥚',
    'egg': '🥚',
    'milk': '🥛',
    'cheese': '🧀',
    'butter': '🧈',
    'cream': '🥛',
    'yogurt': '🥛',
    'cottage': '🧀', // cottage cheese

    // Vegetables
    'broccoli': '🥦',
    'carrots': '🥕',
    'carrot': '🥕',
    'spinach': '🥬',
    'lettuce': '🥬',
    'kale': '🥬',
    'cabbage': '🥬',
    'cauliflower': '🥦',
    'brussels': '🥬', // brussels sprouts
    'asparagus': '🥒',
    'celery': '🥒',
    'cucumber': '🥒',
    'zucchini': '🥒',
    'squash': '🎃',
    'pumpkin': '🎃',
    'eggplant': '🍆',
    'peppers': '🌶️',
    'tomatoes': '🍅',
    'tomato': '🍅',
    'onions': '🧅',
    'onion': '🧅',
    'garlic': '🧄',
    'potatoes': '🥔',
    'potato': '🥔',
    'sweet potato': '🍠',
    'sweet potatoes': '🍠',
    'beets': '🌰',
    'radishes': '🌰',
    'turnips': '🌰',
    'parsnips': '🌰',
    'leeks': '🧅',
    'scallions': '🧅',
    'chives': '🌿',
    'parsley': '🌿',
    'cilantro': '🌿',
    'basil': '🌿',
    'oregano': '🌿',
    'thyme': '🌿',
    'rosemary': '🌿',
    'sage': '🌿',
    'mint': '🌿',

    // Fruits
    'apples': '🍎',
    'apple': '🍎',
    'bananas': '🍌',
    'banana': '🍌',
    'oranges': '🍊',
    'orange': '🍊',
    'lemons': '🍋',
    'lemon': '🍋',
    'limes': '🍋',
    'lime': '🍋',
    'grapes': '🍇',
    'strawberries': '🍓',
    'strawberry': '🍓',
    'blueberries': '🫐',
    'blueberry': '🫐',
    'raspberries': '🍓',
    'raspberry': '🍓',
    'blackberries': '🍓',
    'blackberry': '🍓',
    'cranberries': '🍒',
    'cranberry': '🍒',
    'cherries': '🍒',
    'cherry': '🍒',
    'peaches': '🍑',
    'peach': '🍑',
    'pears': '🍐',
    'pear': '🍐',
    'plums': '🍇',
    'plum': '🍇',
    'pineapple': '🍍',
    'mangoes': '🥭',
    'mango': '🥭',
    'avocados': '🥑',
    'avocado': '🥑',
    'kiwi': '🥝',
    'papaya': '🍈',
    'cantaloupe': '🍈',
    'honeydew': '🍈',
    'watermelon': '🍉',
    'melon': '🍈',
    'coconut': '🥥',
    'dates': '🌰',
    'figs': '🍇',
    'raisins': '🍇',
    'apricots': '🍑',
    'apricot': '🍑',
    'nectarines': '🍑',
    'nectarine': '🍑',
    'grapefruit': '🍊',
    'tangerine': '🍊',
    'applesauce': '🍎',

    // Grains & Cereals
    'rice': '🍚',
    'wheat': '🌾',
    'oats': '🌾',
    'barley': '🌾',
    'quinoa': '🌾',
    'corn': '🌽',
    'bread': '🍞',
    'pasta': '🍝',
    'noodles': '🍜',
    'cereal': '🥣',
    'flour': '🌾',
    'bran': '🌾',
    'bulgur': '🌾',
    'couscous': '🌾',
    'millet': '🌾',
    'buckwheat': '🌾',

    // Legumes & Nuts
    'beans': '🫘',
    'lentils': '🫘',
    'chickpeas': '🫘',
    'peas': '🫛',
    'soybeans': '🫘',
    'black beans': '🫘',
    'kidney beans': '🫘',
    'navy beans': '🫘',
    'pinto beans': '🫘',
    'lima beans': '🫘',
    'almonds': '🥜',
    'walnuts': '🥜',
    'pecans': '🥜',
    'cashews': '🥜',
    'pistachios': '🥜',
    'hazelnuts': '🥜',
    'macadamia': '🥜',
    'brazil nuts': '🥜',
    'peanuts': '🥜',
    'peanut': '🥜',
    'seeds': '🌰',
    'sunflower seeds': '🌻',
    'pumpkin seeds': '🎃',
    'sesame seeds': '🌰',
    'flax seeds': '🌰',
    'chia seeds': '🌰',

    // Oils & Fats
    'oil': '🫒',
    'olive': '🫒',
    'olive oil': '🫒',
    'coconut oil': '🥥',
    'avocado oil': '🥑',
    'canola oil': '🌻',
    'sunflower oil': '🌻',
    'safflower oil': '🌻',
    'sesame oil': '🌰',
    'peanut oil': '🥜',
    'corn oil': '🌽',
    'soybean oil': '🫘',

    // Beverages
    'coffee': '☕',
    'tea': '🍵',
    'water': '💧',
    'juice': '🧃',
    'wine': '🍷',
    'beer': '🍺',
    'soda': '🥤',

    // Herbs & Spices
    'salt': '🧂',
    'cinnamon': '🌰',
    'vanilla': '🌰',
    'ginger': '🌰',
    'turmeric': '🌰',
    'paprika': '🌶️',
    'cumin': '🌰',
    'coriander': '🌰',
    'cardamom': '🌰',
    'nutmeg': '🌰',
    'cloves': '🌰',
    'allspice': '🌰',
    'bay leaves': '🌿',
    'dill': '🌿',
    'fennel': '🌿',
    'tarragon': '🌿',
    'chili': '🌶️',
    'cayenne': '🌶️',
    'mustard seeds': '🌻',
    'poppy seeds': '🌰',

    // Sweeteners
    'sugar': '🍯',
    'honey': '🍯',
    'maple syrup': '🍁',
    'molasses': '🍯',
    'agave': '🍯',

    // Default fallback
    'food': '🍽️',
    'snack': '🍿',
    'drink': '🥤',
    'sauce': '🥄',
    'soup': '🍲',
    'salad': '🥗',
    'sandwich': '🥪',
};

/**
 * Get emoji for a food based on its display name
 * @param displayName The display name of the food
 * @returns The emoji if found, or empty string if not found
 */
export const getFoodEmoji = (displayName: string): string => {
    if (!displayName) return '';

    const normalizedName = displayName.toLowerCase().trim();

    // Direct match first
    if (foodEmojiMap[normalizedName]) {
        return foodEmojiMap[normalizedName];
    }

    // Check if any key is contained in the display name
    for (const [key, emoji] of Object.entries(foodEmojiMap)) {
        if (normalizedName.includes(key)) {
            return emoji;
        }
    }

    return '';
};

/**
 * Format food name with emoji
 * @param displayName The display name of the food
 * @returns The display name with emoji prefix if found
 */
export const formatFoodWithEmoji = (displayName: string): string => {
    const emoji = getFoodEmoji(displayName);
    return emoji ? `${emoji} ${displayName}` : displayName;
}; 