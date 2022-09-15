require("dotenv").config();
const fs = require("fs");
const calculateFullAge = require("full-age-calculator");
const { default: axios } = require("axios");
const { DOMParser, XMLSerializer } = require("xmldom");

const dark_mode_svg = fs.readFileSync("dark-mode.svg", "utf-8");
const light_mode_svg = fs.readFileSync("light-mode.svg", "utf-8");

const dark_document = new DOMParser().parseFromString(dark_mode_svg);
const light_document = new DOMParser().parseFromString(light_mode_svg);

async function get_contributions() {
  /*
  fetches my total contributions and returns it as a number unless catches an error
  */

  const variables = { user: "sumanbiswas7" };
  const headers = {
    authorization: `token ${process.env.TOKEN}`,
  };
  const query = `query ($user: String!) {
  user (login: $user) {
    contributionsCollection {
      contributionYears
      totalCommitContributions
    }
  }
  }`;

  try {
    const res = await axios.post(
      "https://api.github.com/graphql",
      {
        query,
        variables,
      },
      {
        headers,
      }
    );
    const contributions = res.data.data.user.contributionsCollection;
    const totalContributions = contributions.totalCommitContributions;
    const years = contributions.contributionYears;

    return { totalContributions, years };
  } catch (error) {
    return error;
  }
}
function get_uptime(birthDate) {
  /*
  calculates my age returns string if i am still alive-> "[00] years, [00] months, [00] days"
  @params: birthDate: date string in YYYY-MM-DD fromat example: "1900-01-01" 
   */
  const { years, months, days } = calculateFullAge.getFullAge(birthDate);
  if (years > 100) return `I guess I am dead`;

  const years_txt = years === 1 ? `${years} year` : `${years} years`;
  const months_txt = months === 1 ? `${months} month` : `${months} months`;
  const days_txt = days === 1 ? `${days} day` : `${days} days`;

  const uptime = `${years_txt}, ${months_txt}, ${days_txt}`;
  return uptime;
}

async function get_all_data() {
  const { totalContributions, years } = await get_contributions();
  const uptime = get_uptime("2001-04-08");

  return { totalContributions, years, uptime };
}

async function overwrite() {
  /*
    overwrites both dark-mode-svg and light-mode-svg 
    */
  const { uptime, totalContributions, years } = await get_all_data();
  update(uptime, totalContributions + 55, years);
  write_svg();
}

function update(uptime, commits, years) {
  /*
    updates both dark-mode-svg and light-mode-svg in dom
  */
  dark_document.getElementsByTagName("tspan")[30].textContent = uptime;
  dark_document.getElementsByTagName("tspan")[68].textContent = commits;
  // dark_document.getElementsByTagName("tspan")[69].textContent = ` ${years}`;

  light_document.getElementsByTagName("tspan")[30].textContent = uptime;
  light_document.getElementsByTagName("tspan")[68].textContent = commits;
  // light_document.getElementsByTagName("tspan")[69].textContent = ` ${years}`;
}

function write_svg() {
  /*
  writes svg file both dark and light mode 
  */
  const dark_mode_xml = new XMLSerializer().serializeToString(light_document);
  const light_mode_xml = new XMLSerializer().serializeToString(dark_document);

  fs.writeFileSync("dark-mode.svg", light_mode_xml);
  fs.writeFileSync("light-mode.svg", dark_mode_xml);
  console.log("svg written successfully");
}

overwrite();
