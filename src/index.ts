import puppeteer from "puppeteer";
import Fastify from "fastify";
import { clockIn, clockOut, getInfo } from "./browser";
import dotenv from "dotenv";
import { sendMessage } from "./discord";
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
        sendMessage(info ?? "No Info");
      })
      .catch((e) => {
        console.error("There was an error getting info", e);
        sendMessage("There was an error getting info");
      });
    return {
      started: true,
    };
  });

  fastify.get("/in", async function handler(_req, _res) {
    console.log("Getting info");
    clockIn(browser)
      .then(async (info) => {
        console.log("Done: ", info);
        sendMessage("Clocked in");
      })
      .catch((e) => {
        console.error("There was an error clocking in", e);
        sendMessage("ERROR CLOCKING IN");
      });
    return {
      started: true,
    };
  });

  fastify.get("/out", async function handler(_req, _res) {
    console.log("Getting info");
    clockOut(browser)
      .then(async (info) => {
        console.log("Done: ", info);
        sendMessage("Clocked out");
      })
      .catch((e) => {
        console.error("There was an error clocking out", e);
        sendMessage("ERROR CLOCKING OUT");
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
