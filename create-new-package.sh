#!/bin/bash

# 引数が指定されているか確認
if [ -z "$1" ]; then
  echo "使用法: $0 <パッケージ名>"
  exit 1
fi

PACKAGE_NAME="$1"
PACKAGE_DIR="packages"
PACKAGE_PATH="./"$PACKAGE_DIR"/"$PACKAGE_NAME""


# package.json ファイルが存在するか確認
if [ ! -f ./package.json ]; then
  echo "エラー: カレントディレクトリに package.json が存在しません。"
  exit 1
fi

# ./package.json にスクリプトを追加
jq --arg package_name "$PACKAGE_NAME" \
  'def insert_after_key(target_key; new_entry):
    to_entries as $entries |
    ($entries | map(.key) | index(target_key) + 1) as $idx |
    ($entries[0:$idx] + [new_entry] + $entries[$idx:]) |
    from_entries;

  .scripts |= (
    . | insert_after_key("prebuild"; {key: "prebuild:\($package_name)", value: "ln -sf ../../../appsscript.json packages/\($package_name)/dist/appsscript.json"}) |
      insert_after_key("watch"; {key: "watch:\($package_name)", value: "tsc -w -p ./packages/\($package_name)/tsconfig.\($package_name).json"}) |
      insert_after_key("push"; {key: "push:\($package_name)", value: "clasp --project ./packages/\($package_name)/.clasp.json push"}) |
      insert_after_key("build"; {key: "build:\($package_name)", value: "clasp --project ./packages/\($package_name)/.clasp.json push"})
  )' ./package.json > tmp.$$.json && mv tmp.$$.json ./package.json

# 指定されたパッケージ名のディレクトリを作成
mkdir -p "$PACKAGE_PATH"

# パッケージディレクトリ内に初期ファイルを作成
cd "$PACKAGE_PATH" || exit

# echo "{}" > package.json
mkdir -p src
touch src/index.ts
mkdir -p dist


echo "新しいパッケージ '$PACKAGE_NAME' が作成されました。"