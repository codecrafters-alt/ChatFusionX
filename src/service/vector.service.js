const { Pinecone } = require("@pinecone-database/pinecone");
// Initialize a Pinecone client with your API key
const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });

//create and initialize index


//create memory in the index means store the vector representation of the message in the index along with some metadata like user id, chat id, message id etc. so that we can retrieve it later when needed.
async function createMemory({ text, metadata, messageId }) {
  const index = pc.index("chat-gpt").namespace("default");

await index.upsertRecords({
  records: [
    {
      id: String(messageId),
      text: text,
      user: String(metadata.user),
      chat: String(metadata.chat),
    },
  ],
});

  console.log("Upsert successful");
}


async function queryMemory({ text, limit = 3, metadata }) {
  const index = pc.index("chat-gpt").namespace("default");

  const data = await index.searchRecords({
    query: {
      topK: limit, //top 3 similar vectors
      inputs: {
        text: text,
      },
    },
    filter: {
  user: metadata.user,
  chat: metadata.chat,
}

  });
  console.log("Full search response:", data);
  return data?.result?.hits || [];

}

module.exports = { createMemory, queryMemory };
