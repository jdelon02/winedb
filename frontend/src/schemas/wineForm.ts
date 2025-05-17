export const wineFormSchema = {
  type: "object",
  required: ["name", "description", "producer", "country"],
  properties: {
    name: {
      type: "string",
      title: "Wine Name",
      minLength: 3,
      maxLength: 255
    },
    description: {
      type: "string",
      title: "Description",
      minLength: 10
    },
    year: {
      type: "integer",
      title: "Year",
      minimum: 1900,
      maximum: new Date().getFullYear()
    },
    producer: {
      type: "string",
      title: "Producer",
      minLength: 2
    },
    country: {
      type: "string",
      title: "Country",
      minLength: 2
    },
    region: {
      type: "string",
      title: "Region"
    },
    featured_image: {
      type: "string",
      title: "Featured Image",
      format: "data-url"
    },
    varietals: {
      type: "array",
      title: "Varietals",
      minItems: 1,
      items: {
        type: "integer"
      },
      uniqueItems: true
    },
    classifications: {
      type: "array",
      title: "Classifications",
      items: {
        type: "integer"
      },
      uniqueItems: true
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

export const wineFormUiSchema = {
  description: {
    "ui:widget": "textarea"
  },
  country: {
    "ui:widget": "select2",
    "ui:options": {
      loadOptions: "/api/countries",
      labelKey: "name",
      valueKey: "code"
    }
  },
  varietals: {
    "ui:widget": "select2",
    "ui:options": {
      async: true,
      multiple: true,
      loadOptions: "/api/varietals",
      labelKey: "name",
      valueKey: "id"
    }
  },
  classifications: {
    "ui:widget": "select2",
    "ui:options": {
      async: true,
      multiple: true,
      loadOptions: "/api/classifications",
      labelKey: "name",
      valueKey: "id"
    }
  },
  tags: {
    "ui:widget": "select2",
    "ui:options": {
      async: true,
      multiple: true,
      loadOptions: "/api/tags?type=wine",
      labelKey: "name",
      valueKey: "id"
    }
  }
};
