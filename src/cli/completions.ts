const flags = [
  "--help",
  "--version",
  "--resume",
  "--list",
  "--kill",
  "--setup",
  "--uninstall",
  "--quiet",
  "--verbose",
  "--json",
  "--completions",
  "-h",
  "-V",
  "-r",
  "-l",
  "-k",
  "-q",
  "-v",
];

const flagsLine = flags.join(" ");

function bashScript(): string {
  return `# bash completions for sinc\n# flags: ${flagsLine}\ncomplete -W "${flagsLine}" sinc\n`;
}

function zshScript(): string {
  const args = flags.map((flag) => `'${flag}[${flag}]'`).join(" ");
  return `#compdef sinc\n# flags: ${flagsLine}\n_arguments -s ${args}\n`;
}

function fishScript(): string {
  const lines = [
    "# fish completions for sinc",
    `# flags: ${flagsLine}`,
    ...flags.map((flag) => {
      if (flag.startsWith("--")) {
        return `complete -c sinc -l ${flag.slice(2)}`;
      }
      return `complete -c sinc -s ${flag.slice(1)}`;
    }),
  ];
  return `${lines.join("\n")}\n`;
}

export function getCompletionScript(shell: string): string {
  switch (shell) {
    case "bash":
      return bashScript();
    case "zsh":
      return zshScript();
    case "fish":
      return fishScript();
    default:
      throw new Error(`Unsupported shell: ${shell}`);
  }
}
