chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
  if (msg.color) {
    console.log("Receive color = " + msg.color);
    document.body.style.backgroundColor = msg.color;
    sendResponse("Change color to " + msg.color);
  } else {
    sendResponse("Color message is none.");
  }
});

//Log DOM
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "domData") {
    //const dom = document.documentElement.outerHTML;
    let infoBlockObj = findModelInformation();
    let carouseLinksObj = findCarouseLinks();
    let downloadLinkObj = findDownloadLinks();
    let fileTypeObj = findFileType()

    let domDataObj = packUpObjects(infoBlockObj, carouseLinksObj, downloadLinkObj, fileTypeObj)

    //console.log("Current URL DOM:", dom);
    chrome.runtime.sendMessage({ action: "domData", domDataObj });
  }
});

const findDownloadLinks = () => {
  const downloadLink = document.querySelector('.mantine-zj7kjy') as HTMLAnchorElement | null;
  const downloadUrl = downloadLink?.href;
  return downloadUrl;
}

const findModelInformation = () => {
  // Find the information block and copy its HTML to the clipboard
  let infoBlock1 = (document.querySelector('.mantine-twkrib')?.nextElementSibling?.outerHTML) || '';

  let infoBlock2 = (document.querySelector('.mantine-agabl4')?.outerHTML) || '';

  return { infoBlock1, infoBlock2 };
}

const findFileType = () => {
  let fileType = (document.querySelector('.mantine-1cvam8p')?.outerHTML) || '';

  const textContent = (fileType.match(/<span.*?>(.*?)<\/span>/)?.[1] || '').replace(/<!--(.*?)-->/g, '').trim();

  return { fileType: textContent.toLowerCase() }
}

const findCarouseLinks = () => {
  // Find all the anchor elements inside the carousel
  let carouselLinks = document.querySelectorAll('.mantine-16mk38b a');

  // Extract the href attribute from each link and store it in an array
  let urls: string[] = [];
  carouselLinks.forEach(function (link) {
    let anchorElement = link as HTMLAnchorElement; // Type cast to HTMLAnchorElement
    urls.push(anchorElement.href);
  });

  // Create a new unordered list element
  let urlList = document.createElement('div');

  // Append a list item element for each URL
  urls.forEach(function (url) {
    let listItem = document.createElement('div');
    let textNode = document.createTextNode(url);

    let a = document.createElement('a');
    a.setAttribute('href', url);
    a.textContent = url;

    listItem.appendChild(a);

    let br = document.createElement('br');
    listItem.appendChild(br);

    urlList.appendChild(listItem);
  });

  return { urlList }
}

const packUpObjects = (infoBlockObj: any, carouseLinksObj: any, downloadLinkObj: any, fileTypeObj: any) => {
  let infoText = `\n-------------\nCreater Description\n-------------\n${infoBlockObj.infoBlock1}\n\n-------------\n Model Information\n-------------\n${infoBlockObj.infoBlock2}\n-------------\n Images\n-------------\n${carouseLinksObj.urlList.outerHTML}`;
  let htmlString = infoText.replace(/\n/g, "<br>");
  let currentUrl = window.location.toString();
  let empty = ""
  let excelText = `${empty}	${htmlString}	${currentUrl}`
  return { infoBlock: htmlString, currentUrl: currentUrl, downloadLink: downloadLinkObj, fileType: fileTypeObj.fileType, excelText: excelText }
}