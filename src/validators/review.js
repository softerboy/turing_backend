const Schema = require('async-validator')

const { errorBuilder, errorWrapper } = require('../utils/error-handler')

module.exports = {
  validateReviewForm(reviewForm) {
    const descriptior = {
      product_id: [
        {
          required: true,
          message: errorBuilder(
            'The product_id field is required',
            'REVIEW_01',
            'product_id',
          ),
        },
      ],

      review: [
        {
          required: true,
          message: errorBuilder(
            'The review field is required',
            'REVIEW_02',
            'reivew',
          ),
        },
        {
          min: 50,
          message: errorBuilder(
            'The review text must be at least 50 characters long',
            'REVIEW_02',
            'review',
          ),
        },
      ],

      rating: [
        {
          required: true,
          message: errorBuilder(
            'The rating field is required',
            'REVIEW_03',
            'rating',
          ),
        },
        {
          min: 0,
          type: 'number',
          message: errorBuilder(
            // eslint-disable-next-line quotes
            "The rating can't be negative number",
            'REVIEW_03',
            'rating',
          ),
        },
        {
          max: 5,
          type: 'number',
          message: errorBuilder(
            // eslint-disable-next-line quotes
            "The rating can't be bigger than 5",
            'REVIEW_03',
            'rating',
          ),
        },
      ],
    }

    return new Schema(descriptior).validate(reviewForm).catch(err => {
      throw errorWrapper(err)
    })
  },
}
