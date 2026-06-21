#!/usr/bin/env bash
nix-shell -p stdenv.cc.cc.lib zlib --run "
  export LD_LIBRARY_PATH=\$(nix-build --no-out-link -E 'with import <nixpkgs> {}; stdenv.cc.cc.lib')/lib
  source .venv/bin/activate
  uvicorn app.main:app --reload
"
