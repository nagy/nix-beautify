with import <nixpkgs> {};
stdenv.mkDerivation {
  name = "nix-beautify";
  src = ./.;

  phases = [ "installPhase" ];

  buildInputs = [ nodejs ];

  installPhase = ''
    mkdir -p $out/bin
    cp $src/nix-beautify.js $out/bin/nix-beautify
    patchShebangs $out/bin/nix-beautify
  '';
}
