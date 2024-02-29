"use strict";

// Get Date
const getDate = (date) => {
  let datePosted = new Date(date);
  let currentDate = new Date();
  const monthPosted = datePosted.toLocaleString("default", { month: "short" });
  const dayPosted = datePosted.getDate();
  const yearPosted = datePosted.getFullYear();
  let result;

  // seconds
  if (currentDate - datePosted < 1000 * 60) {
    const seconds = Math.floor((currentDate - datePosted) / 1000);
    result = `${seconds} ${seconds === 1 ? "second" : "seconds"} ago`;
    // minutes
  } else if (currentDate - datePosted < 1000 * 60 * 60) {
    const minutes = Math.floor((currentDate - datePosted) / (1000 * 60));
    result = `${minutes} ${minutes === 1 ? "minute" : "minutes"} ago`;
    // hours
  } else if (currentDate - datePosted < 1000 * 60 * 60 * 24) {
    const hours = Math.floor((currentDate - datePosted) / (1000 * 60 * 60));
    result = `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
    // days
  } else if (currentDate - datePosted < 1000 * 60 * 60 * 24 * 7) {
    const days = Math.floor((currentDate - datePosted) / (1000 * 60 * 60 * 24));
    result = `${days} ${days === 1 ? "day" : "days"} ago`;
    // years
  } else {
    result = `${monthPosted} ${dayPosted}, ${yearPosted}`;
  }
  return result;
};

module.exports = {
  getDate,
};
