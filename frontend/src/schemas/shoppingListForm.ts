export const shoppingListFormSchema = {
  type: "object",
  required: ["name"],
  properties: {
    name: {
      type: "string",
      title: "List Name",
      minLength: 3,
      maxLength: 255
    },
    description: {
      type: "string",
      title: "Description"
    },
    items: {
      type: "array",
      title: "Items",
      items: {
        type: "object",
        required: ["quantity", "unit"],
        oneOf: [
          {
            required: ["ingredient_id"],
            properties: {
              ingredient_id: {
                type: "integer",
                title: "Ingredient"
              }
            }
          },
          {
            required: ["wine_id"],
            properties: {
              wine_id: {
                type: "integer",
                title: "Wine"
              }
            }
          }
        ],
        properties: {
          quantity: {
            type: "number",
            title: "Quantity",
            minimum: 0,
            exclusiveMinimum: true
          },
          unit: {
            type: "string",
            title: "Unit"
          },
          notes: {
            type: "string",
            title: "Notes"
          },
          checked: {
            type: "boolean",
            title: "Completed",
            default: false
          }
        }
      }
    }
  }
};

export const shoppingListFormUiSchema = {
  description: {
    "ui:widget": "textarea"
  },
  items: {
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
      },
      wine_id: {
        "ui:widget": "select2",
        "ui:options": {
          async: true,
          loadOptions: "/api/wines",
          labelKey: "name",
          valueKey: "id"
        }
      },
      checked: {
        "ui:widget": "checkbox"
      }
    }
  }
};
