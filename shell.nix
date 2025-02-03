{ sources ? import ./nix/sources.nix }:
let
  pkgs = import sources.nixpkgs { };
  guardianNix = builtins.fetchGit {
    url = "git@github.com:guardian/guardian-nix.git";
    ref = "refs/tags/v1";
  };
  guardianDev = import "${guardianNix.outPath}/guardian-dev.nix" pkgs;
  frontend = pkgs.writeShellApplication {
    name = "newsletters-nx";
    runtimeInputs = [ pkgs.nodejs_18 ];
    text = ''
      npm install
      npm run dev
    '';
  };
in guardianDev.devEnv {
  name = "newsletters-nx";
  commands = [ frontend ];
}
