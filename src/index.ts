import puppeteer from "puppeteer";
import Fastify from "fastify";
import { getInfo } from "./browser";
import dotenv from "dotenv";
dotenv.config();

async function main() {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox"],
  });

  const fastify = Fastify({
    logger: true,
  });

  fastify.get("/info", async function handler(_req, _res) {
    console.log("Getting info");
    getInfo(browser)
      .then(async (info) => {
        console.log("Done: ", info);
      })
      .catch((e) => {
        console.error("There was an error getting info", e);
      });
    return {
      started: true,
    };
  });

  try {
    // Work with docker
    await fastify.listen({
      port: 8080,
      host: "0.0.0.0",
    });
  } catch (error) {
    fastify.log.error(error);
    process.exit(1);
  }
}

main();
