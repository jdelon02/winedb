export const recipeFormSchema = {
  type: "object",
  required: ["title", "description", "prep_time", "cook_time", "servings", "difficulty_level"],
  properties: {
    title: {
      type: "string",
      title: "Recipe Title",
      minLength: 3,
      maxLength: 255
    },
    description: {
      type: "string",
      title: "Description",
      minLength: 10
    },
    prep_time: {
      type: "integer",
      title: "Preparation Time (minutes)",
      minimum: 1
    },
    cook_time: {
      type: "integer",
      title: "Cooking Time (minutes)",
      minimum: 0
    },
    servings: {
      type: "integer",
      title: "Number of Servings",
      minimum: 1
    },
    difficulty_level: {
      type: "string",
      title: "Difficulty Level",
      enum: ["easy", "medium", "hard", "expert"],
      enumNames: ["Easy", "Medium", "Hard", "Expert"]
    },
    featured_image: {
      type: "string",
      title: "Featured Image",
      format: "data-url"
    },
    steps: {
      type: "array",
      title: "Recipe Steps",
      minItems: 1,
      items: {
        type: "object",
        required: ["instruction"],
        properties: {
          step_number: {
            type: "integer",
            title: "Step Number"
          },
          instruction: {
            type: "string",
            title: "Instruction",
            minLength: 3
          },
          image: {
            type: "string",
            title: "Step Image",
            format: "data-url"
          }
        }
      }
    },
    ingredients: {
      type: "array",
      title: "Ingredients",
      minItems: 1,
      items: {
        type: "object",
        required: ["ingredient_id", "quantity", "unit"],
        properties: {
          ingredient_id: {
            type: "integer",
            title: "Ingredient"
          },
          quantity: {
            type: "number",
            title: "Quantity",
            minimum: 0,
            exclusiveMinimum: true
          },
          unit: {
            type: "string",
            title: "Unit",
            enum: ["g", "kg", "ml", "l", "tsp", "tbsp", "cup", "piece", "pinch"]
          },
          notes: {
            type: "string",
            title: "Notes"
          }
        }
      }
    },
    tags: {
      type: "array",
      title: "Tags",
      items: {
        type: "integer"
      },
      uniqueItems: true
    }
  }
};

export const recipeFormUiSchema = {
  description: {
    "ui:widget": "textarea"
  },
  steps: {
    "ui:options": {
      orderable: true
    },
    items: {
      instruction: {
        "ui:widget": "textarea"
      }
    }
  },
  ingredients: {
    "ui:options": {
      orderable: true
    },
    items: {
      ingredient_id: {
        "ui:widget": "select2",
        "ui:options": {
          async: true,
          loadOptions: "/api/ingredients",
          labelKey: "name",
          valueKey: "id"
        }
      }
    }
  },
  tags: {
    "ui:widget": "select2",
    "ui:options": {
      async: true,
      multiple: true,
      loadOptions: "/api/tags?type=recipe",
      labelKey: "name",
      valueKey: "id"
    }
  }
};
