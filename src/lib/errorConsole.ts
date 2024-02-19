
const errorConsole = (message: string, description: string) => {
  return `console.log("%c${message}%c : ${description}", "background-color:red;color:white;", "color:initial;")`;
};

export { errorConsole };