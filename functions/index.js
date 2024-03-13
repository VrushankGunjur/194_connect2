/* eslint-disable require-jsdoc */
/* eslint-disable max-len */
/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const {onRequest} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const functions = require("firebase-functions");
const Filter = require("bad-words");
const admin = require("firebase-admin");
admin.initializeApp();

// const db = admin.firestore();
// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

exports.helloWorld = onRequest((request, response) => {
  logger.info("Hello logs!", {structuredData: true});
  response.send("Hello from Firebase!");
});

exports.moderator = functions.database.ref("/messages/{messageId}")
    .onWrite((event) => {
      const message = event.data.val();
      const filter = new Filter();

      if (message && !message.sanitized) {
        // Retrieved the message values.
        console.log("Retrieved message content: ", message);

        // Run moderation checks on on the message and moderate if needed.
        const moderatedMessage = filter.clean(message).text;

        // Update the Firebase DB with checked message.
        console.log("Message has been moderated. Saving to DB: ", moderatedMessage);
        return event.data.adminRef.update({
          text: moderatedMessage,

        });
      }
    });
