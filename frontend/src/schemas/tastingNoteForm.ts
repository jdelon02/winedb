export const tastingNoteFormSchema = {
  type: "object",
  required: ["notes"],
  properties: {
    notes: {
      type: "string",
      title: "Tasting Notes",
      minLength: 10
    },
    tasted_at: {
      type: "string",
      title: "Tasting Date",
      format: "date-time",
      default: new Date().toISOString()
    }
  }
};

export const tastingNoteFormUiSchema = {
  notes: {
    "ui:widget": "textarea",
    "ui:options": {
      rows: 5
    }
  },
  tasted_at: {
    "ui:widget": "datetime"
  }
};
