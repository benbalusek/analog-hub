"use strict";

// Npm modules
const BaseJoi = require("joi");
const sanitizeHtml = require("sanitize-html");

//////////////////////////////////////////////////////////////////////
// Joi extension
const extension = (joi) => ({
  type: "string",
  base: joi.string(),
  messages: {
    "string.escapeHTML": "{{#label}} much not include HTML!",
  },
  rules: {
    escapeHTML: {
      validate(value, helpers) {
        const clean = sanitizeHtml(value, {
          allowedTags: [],
          allowedAttributes: {},
        });
        if (clean !== value)
          return helpers.error("string.escapeHTML", { value });
        return clean;
      },
    },
  },
});

const Joi = BaseJoi.extend(extension);

//////////////////////////////////////////////////////////////////////
// Joi schemas
module.exports.photoSchema = Joi.object({
  photo: Joi.object({
    title: Joi.string().required().escapeHTML(),
    description: Joi.string().required().escapeHTML(),
    location: Joi.string().required().escapeHTML(),
  }).required(),
});

module.exports.commentSchema = Joi.object({
  comment: Joi.object({
    text: Joi.string().required().escapeHTML(),
  }).required(),
});
