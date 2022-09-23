# deno-msgpack-bench

## 概要

DenoにおけるMessagePackのパフォーマンスを測定してみるリポジトリ。

## 詳細

Denoにおいて、JSONのようにデータを記述したファイルを高速に読み込む方法について調べてみた。比較対象は、JSONとminified JSONとMessagePackの3種。YAMLとTOMLはベンチマークがつらくなるほど遅かったので割愛。

```sh
$ ls -l ./assets/
total 66088
-rw-r--r-- 1 okayurisotto okayurisotto 33222469  9月 23 11:33 jisyo.json
-rw-r--r-- 1 okayurisotto okayurisotto 19502860  9月 23 11:41 jisyo.min.json
-rw-r--r-- 1 okayurisotto okayurisotto 14944172  9月 23 11:45 jisyo.msgpack
```

```
# ファイルサイズ比較
JSON             100%
minified JSON     58%
MessagePack       44%
```

```sh
$ wc --chars ./assets/*
29916897 jisyo.json
16197288 jisyo.min.json
 9205923 jisyo.msgpack
55320108 total
```

## `./assets/jisyo.json`

普通のJSONファイル。中身は、[okayurisotto/skk-dicts](https://github.com/okayurisotto/skk-dicts)にある[`388ba74`時点の`SKK-JISYO.L.json`](https://github.com/okayurisotto/skk-dicts/blob/388ba74ab2472e175a0bb4f6c697a4635fa151c5/src/SKK-JISYO.L.json)。

## `./assets/jisyo.min.json`

`./assets/jisyo.json`をminifyしたもの。

```typescript
Deno.writeTextFileSync(
  "./assets/jisyo.min.json",
  JSON.stringify(JSON.parse(
    Deno.readTextFileSync("./assets/jisyo.json")
  ))
)
```

## `./assets/jisyo.msgpack`

`./assets/jisyo.json`を[MessagePack形式](https://msgpack.org/)にしたもの。

```typescript
import { encode } from "@msgpack/msgpack";

Deno.writeFileSync(
  "./assets/jisyo.min.json",
  encode(JSON.parse(
    Deno.readTextFileSync("./assets/jisyo.json")
  ))
)
```

## ベンチマーク内容

- ファイルの単純な読み込み
  - `read: jisyo.json`
  - `read: jisyo.min.json`
  - `read: jisyo.msgpack`
- ファイルの内容の文字列化
  - `read + stringify: jisyo.json`
  - `read + stringify: jisyo.min.json`
  - MessagePack形式はバイナリであるため省略
- ファイルの内容のオブジェクト化
  - `read + stringify + parse: jisyo.json`
  - `read + stringify + parse: jisyo.min.json`
  - `read + parse: jisyo.msgpack`

## 実行方法

```sh
deno task bench
```

## 実行結果の一例

```
cpu: AMD Ryzen 5 5600X 6-Core Processor
runtime: deno 1.25.3 (x86_64-unknown-linux-gnu)

file:///home/okayurisotto/ghq/github.com/okayurisotto/deno-msgpack-bench/src/bench.ts
benchmark                                     time (avg)             (min … max)       p75       p99      p995
-------------------------------------------------------------------------------- -----------------------------
read: jisyo.json                             5.3 ms/iter     (4.28 ms … 7.48 ms)   5.68 ms   7.48 ms   7.48 ms
read: jisyo.min.json                        2.85 ms/iter     (2.16 ms … 5.24 ms)   3.13 ms   4.97 ms   5.24 ms
read: jisyo.msgpack                         1.84 ms/iter     (1.23 ms … 4.65 ms)   2.02 ms    3.3 ms   3.93 ms
read + stringify: jisyo.json               68.91 ms/iter   (67.85 ms … 70.07 ms)  69.75 ms  70.07 ms  70.07 ms
read + stringify: jisyo.min.json           47.38 ms/iter   (47.03 ms … 47.74 ms)  47.53 ms  47.74 ms  47.74 ms
read + stringify + parse: jisyo.json      254.28 ms/iter (232.03 ms … 272.08 ms) 266.58 ms 272.08 ms 272.08 ms
read + stringify + parse: jisyo.min.json  215.79 ms/iter (193.98 ms … 233.21 ms) 229.53 ms 233.21 ms 233.21 ms
read + parse: jisyo.msgpack               173.08 ms/iter  (116.5 ms … 220.25 ms) 203.23 ms 220.25 ms 220.25 ms
```

単純なファイル読み込み速度に関しても、JSONよりminified JSONよりMessagePackが速かったが、これだけ大きなデータでも数msの差に留まる。

JSONとminified JSONで必要になる文字列化の処理にはそこそこ時間がかかる。

ファイルから読み込んだデータのオブジェクト化にはさらに時間がかかる。ただそれでも、JSONよりminified JSONよりMessagePackのほうが速い。
