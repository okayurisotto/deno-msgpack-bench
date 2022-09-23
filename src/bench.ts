import { resolve } from "@std/path/mod.ts";
import { decode } from "@msgpack/msgpack";

const __dirname = new URL(".", import.meta.url).pathname;

const files = {
  "json": resolve(__dirname, "../assets/jisyo.json"),
  "minifiedJson": resolve(__dirname, "../assets/jisyo.min.json"),
  "msgpack": resolve(__dirname, "../assets/jisyo.msgpack"),
};

Deno.bench("read: jisyo.json", () => {
  Deno.readFileSync(files.json);
});

Deno.bench("read: jisyo.min.json", () => {
  Deno.readFileSync(files.minifiedJson);
});

Deno.bench("read: jisyo.msgpack", () => {
  Deno.readFileSync(files.msgpack);
});

Deno.bench("read + stringify: jisyo.json", () => {
  Deno.readTextFileSync(files.json);
});

Deno.bench("read + stringify: jisyo.min.json", () => {
  Deno.readTextFileSync(files.minifiedJson);
});

Deno.bench("read + stringify + parse: jisyo.json", () => {
  JSON.parse(Deno.readTextFileSync(files.json));
});

Deno.bench("read + stringify + parse: jisyo.min.json", () => {
  JSON.parse(Deno.readTextFileSync(files.minifiedJson));
});

Deno.bench("read + parse: jisyo.msgpack", () => {
  decode(Deno.readFileSync(files.msgpack));
});
