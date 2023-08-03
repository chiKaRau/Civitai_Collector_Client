import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { Form, Button, FormControl, InputGroup, OverlayTrigger, Tooltip, Alert } from 'react-bootstrap';

import { BiRefresh } from 'react-icons/bi';
import {
  BsCheck, BsArrowRepeat, BsStarFill, BsStar, BsDownload,
  BsFillClipboard2PlusFill, BsFillFileEarmarkArrowUpFill, BsInfoCircleFill,
} from 'react-icons/bs';

import { BiUndo } from "react-icons/bi"
import { GrCopy, GrClose } from 'react-icons/gr';
import { PiMagnifyingGlassBold } from "react-icons/pi"
import { SiTask } from "react-icons/si";

//Components
import SimilarLoraPopup from "./components/SimilarLoraPopup";
import UpdateLoraPopup from "./components/UpdateLoraPopup";
import CheckLoraPopup from "./components/CheckLoraPopup";
import LastAppendLoraPopup from "./components/LastAppendLoraPopup";
import AutocompleteInput from "./components/AutocompleteInput";
import SuggestionTagPanel from "./components/SuggestionTagPanel"
import FunctionButton from "./components/FunctionButton";

import axios from "axios"

import config from "./config/config.json"

interface DomData {
  infoBlock: string;
  currentUrl: string;
  excelText: string;
  fileType: string;
  downloadLink: string;
  // Other properties if applicable
}

const Popup = () => {
  const [domData, setDOMData] = useState<object | undefined>();
  const [selectedSheet, setSelectedSheet] = useState('');
  const [sheetsList, setSheetsList] = useState([]);
  const [isLoading, setIsLoading] = useState(false)

  const [fileName, setFilename] = useState(''); //Lora File Name
  const [fileType, setFileType] = useState("")
  const [imagesArray, setImagesArray] = useState("")
  const [fileExtension, setFileExtension] = useState('') //Lora File Extension
  const [downloadFilePath, setdownloadFilePath] = useState('') //Client File Download Path

  const [loraInfo, setLoraInfo] = useState(''); //Lora Info
  const [loraURL, setLoraURL] = useState(''); //Lora URL
  const [downloadURL, setDownloadURL] = useState(''); //Lora Download URL

  const [isInputsDisabled, setIsInputsDisabled] = useState(true);

  const [bookmarkId, setBookmarkId] = useState("");
  const [isFavorite, setIsFavorite] = useState(false);

  const [isSimilarLoraPopupOpen, setIsSimilarLoraPopupOpen] = useState(false);
  const [isUpdateLoraPopupOpen, setIsUpdateLoraPopupOpen] = useState(false);
  const [isCheckingLoraPopupOpen, setIsCheckingLoraPopupOpen] = useState(false);
  const [isLastAppendedLoraPopupOpen, setIsLastAppendedLoraPopupOpen] = useState(false)

  const [errorObj, setErrorObj] = useState<{ name?: string; message?: string; }>({});

  //Init Sheets List
  useEffect(() => {
    // Retrieve the last selected sheet option from Chrome storage
    chrome.storage.sync.get(['selectedSheet'], (result) => {
      const storedSelectedSheet = result.selectedSheet;
      setSelectedSheet(storedSelectedSheet || 'Sheet1');
    });

    // Retrieve the last downloadFilePath value from Chrome storage
    chrome.storage.sync.get(['downloadFilePath'], (result) => {
      const storedDownloadFilePath = result.downloadFilePath;
      setdownloadFilePath(storedDownloadFilePath || '/@scan@/ACG/Characters (Anime)/');
    });
  }, []);


  useEffect(() => {
    // Store the selected sheet option in Chrome storage
    chrome.storage.sync.set({ selectedSheet });
  }, [selectedSheet]);

  //Init Lora
  useEffect(() => {
    // Update SheetsList
    handleRefreshSheetList()

    // Getting DOM Data
    handleGettingDOMData()

  }, []);

  // Listen for changes in lora Url
  useEffect(() => {
    if (loraURL) {
      // Trigger handleGettingLoraFileInfo() to get the lora file name
      handleGettingLoraFileInfo();

      //Triger checkBookmarkStatus() to see if current url has already bookmarked.
      checkBookmarkStatus();
    }
  }, [loraURL, fileType]);

  const checkBookmarkLocation = () => {

    if (fileType.includes("lora")) {
      return "5";
    } else if (fileType.includes("checkpoint")) {
      return "9833"
    } else if (fileType.includes("textual")) {
      return "5925"
    } else {
      return "5"
    }

  }

  // Check if the current page is already bookmarked
  const checkBookmarkStatus = () => {
    chrome.bookmarks.getChildren(checkBookmarkLocation(), (results) => {
      const bookmark = results.find((bookmark) => {
        if (bookmark.url === loraURL) {
          return bookmark
        }
      });

      if (bookmark) {
        setIsFavorite(true);
        setBookmarkId(bookmark.id);
      } else {
        setIsFavorite(false);
        setBookmarkId("");
      }
    });
  };

  const toggleSimilarLoraPopupOpen = () => {
    setIsSimilarLoraPopupOpen((prevState) => !prevState);
  };

  const toggleUpdateLoraPopupOpen = () => {
    setIsUpdateLoraPopupOpen((prevState) => !prevState);
  };

  const toggleCheckingLoraPopupOpen = () => {
    setIsCheckingLoraPopupOpen((prevState) => !prevState);
  };

  const toggleLastAppendedLoraPopupOpen = () => {
    setIsLastAppendedLoraPopupOpen((prevState) => !prevState);
  };

  const handleDownload = async () => {
    console.log("Calling handleDownload")

    const modelID = loraURL.match(/\/models\/(\d+)/)?.[1] || '';

    /*
       // Open a new window
        let serverlink = `${config.domain}/api/download-file?downloadurl=${downloadURL}&loraFileName=${fileName}&downloadFilePath=${downloadFilePath}&modelID=${modelID}&loraFileExtension=${fileExtension}`
    
        let newWindow = window.open(serverlink, '_blank');
        newWindow?.close();
        //window.location.href = downloadLink;
    */
    try {
      const response = await axios.post(`${config.domain}/api/download-file`, {
        data: { downloadurl: downloadURL, loraFileName: fileName, downloadFilePath: downloadFilePath, modelID: modelID, loraFileExtension: fileExtension }
      });
    } catch (error: any) {
      console.error(error);
      errorhandler(error)
    }
  };


  const removeBookmark = () => {
    console.log("Calling removeBookmark")
    chrome.bookmarks.remove(bookmarkId, () => {
      setIsFavorite(false);
      setBookmarkId("");
    });
  }

  const addBookmark = () => {
    console.log("Calling addBookmark")
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      if (tabs.length > 0) {
        const currentTab = tabs[0];
        const bookmarkData = {
          title: currentTab.title,
          url: currentTab.url,
          parentId: checkBookmarkLocation() // Specify the ID of the parent folder where you want to place the bookmark
        };

        chrome.bookmarks.create(bookmarkData, function (bookmark) {

          setIsFavorite(true);
          setBookmarkId(bookmark.id);
          console.log("Bookmark created:", bookmark);
        });
      }
    });
  }

  const handleToggleFavorite = () => {
    console.log("Calling handleToggleFavorite")
    if (isFavorite) {
      // Unbookmark the page
      if (bookmarkId) {
        removeBookmark()
      }
    } else {
      // Bookmark the page
      addBookmark()
    }
  };

  const handleGettingDOMData = () => {
    console.log("Calling handleGettingDOMData")
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      setIsLoading(true);
      if (tabs[0]?.url) {
        setLoraURL(tabs[0].url);

        // Send a message to the content script to log the DOM
        chrome.tabs.sendMessage(tabs[0].id as number, { action: "domData" });
      }

      // Listen for messages from the content script
      chrome.runtime.onMessage.addListener((message) => {
        if (message.action === "domData") {
          setDOMData(message.domDataObj);
          let { infoBlock } = message.domDataObj as DomData;
          setFileType(message.domDataObj.fileType)
          setLoraInfo(infoBlock);
          setIsLoading(false)
        }
      });
    });

    // Set loading to false if there's an error or timeout
    setTimeout(() => {
      setIsLoading(false);
    }, 5000); // Change the timeout value as needed

  }

  const handleAppendIntoSheet = async () => {
    console.log("Calling handleAppendIntoSheet")
    let { infoBlock, currentUrl } = domData as DomData;
    let loraFileName = fileName;
    try {
      const response = await axios.post(`${config.domain}/api/write-to-sheet`,
        { data: { selectedSheet: selectedSheet, loraFileName: loraFileName, infoBlock: infoBlock, currentUrl: currentUrl, imagesArray: imagesArray } });
      console.log('Tables:', response.data);
    } catch (error: any) {
      console.error(error);
      errorhandler(error)
    }
  };

  const handleRemoveFromSheet = async () => {
    console.log("Calling handleRemoveFromSheet")
    let { currentUrl } = domData as DomData;

    try {
      const response = await axios.post(`${config.domain}/api/remove-from-sheet`, { data: { selectedSheet: selectedSheet, loraFileName: fileName, url: currentUrl } });
    } catch (error: any) {
      console.error(error);
      errorhandler(error)
    }
  };

  const handleRemoveAndUnbookmark = async () => {
    console.log("Calling handleRemoveAndUnbookmark")
    try {
      await handleRemoveFromSheet();
      handleToggleFavorite();
    } catch (error: any) {
      console.error(error);
      errorhandler(error)
    }
  };

  const handleCopytoClipboard = () => {
    let { excelText } = domData as DomData;
    try {
      navigator.clipboard.writeText(excelText)
    } catch (error: any) {
      console.error(error);
      errorhandler(error)
    }
  };

  const handleRefreshSheetList = async () => {
    console.log('Calling handleRefreshSheetList');
    setIsLoading(true)
    try {
      const response = await axios.get(`${config.domain}/api/list-sheets`);
      setSheetsList(response.data)
    } catch (error: any) {
      console.error(error);
      errorhandler(error)
    } finally {
      setIsLoading(false)
    }
  };

  const handleGettingLoraFileInfo = async () => {
    console.log('Calling handleGettingLoraFileInfo');
    setIsLoading(true)
    const modelId = loraURL.match(/\/models\/(\d+)/)?.[1] || '';
    const civitai_api = `https://civitai.com/api/v1/models/${modelId}`;
    try {
      const response = await axios.get(civitai_api);
      const model = await response.data;

      //impoment here
      //use the version number for modelVersionsIndex
      let modelVersionsIndex = 0;
      const hasModelVersionId = loraURL.includes('modelVersionId=');

      if (hasModelVersionId) {
        const match = loraURL.match(/modelVersionId=(\d+)/);
        const id = match ? parseInt(match[1]) : 0;
        for (let i = 0; i < model.modelVersions.length; i++) {
          if (model.modelVersions[i].id === id) {
            modelVersionsIndex = i;
            break;
          }
        }
      }

      //fileIndex
      let fileIndex = 0;
      if (model.modelVersions[modelVersionsIndex].files.length > 1) {
        fileIndex = model.modelVersions[modelVersionsIndex].files.findIndex((obj: any) => obj.type === "Model");
      }

      let imageArray = model.modelVersions[modelVersionsIndex].images.map((obj: any) => {
        return {
          url: obj.url,
          nsfw: "Soft",
          width: 512,
          height: 512
        }
      })

      setDownloadURL(model.modelVersions[modelVersionsIndex].files[fileIndex].downloadUrl)
      setFilename(model.modelVersions[modelVersionsIndex].files[fileIndex].name.split(".")[0])
      setImagesArray(imageArray)
      setFileExtension(model.modelVersions[modelVersionsIndex].files[fileIndex].name.split(".").reverse()[0])

    } catch (error: any) {
      console.error(error);
      errorhandler(error)
    } finally {
      setIsLoading(false)
    }

  }

  const handleAll = async () => {
    console.log("Calling handleAll")
    try {
      handleToggleFavorite();
      handleAppendIntoSheet();
      await handleDownload();
    } catch (error: any) {
      console.error(error);
      errorhandler(error)
    }
  };

  const handleSheetSelection = (event: any) => {
    console.log("Calling handleSheetSelection")
    setSelectedSheet(event.target.value);
  };

  const handleCheckboxChange = (event: any) => {
    setIsInputsDisabled(event.target.checked);
  };

  const renderTooltip = (tooltipText: any) => (
    <Tooltip id="tooltip">{tooltipText}</Tooltip>
  );

  const errorhandler = (errorObj: any) => {
    console.log("Calling errorhandler")
    if (errorObj.response?.data !== undefined) {
      setErrorObj(errorObj.response.data.error)
    } else {
      setErrorObj({ name: "InternalClientError", message: "Internal Client Error" })
    }
  }

  return (
    <div className="container" style={{ padding: "5px" }}>

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>

        {/**Find Similar Saved Lora Button*/}
        <FunctionButton b_placement={"bottom"} b_tooltip={"Saved Lora"} b_variant={"success"} b_style={""} b_className={"popup-button"}
          b_disabled={false}
          b_handleApiCall={toggleSimilarLoraPopupOpen} b_icon={<PiMagnifyingGlassBold />} isApiCall={true} />

        {/**Checking Current Lora Button */}
        <FunctionButton b_placement={"bottom"} b_tooltip={"Checking Current Lora Info"} b_variant={"success"} b_style={""} b_className={"popup-button"}
          b_disabled={false}
          b_handleApiCall={toggleCheckingLoraPopupOpen} b_icon={<BsInfoCircleFill />} isApiCall={true} />

        {/**Find Last Appended Collection's Doc Button */}
        <FunctionButton b_placement={"bottom"} b_tooltip={"Find Last Appended Lora"} b_variant={"success"} b_style={""} b_className={"popup-button"}
          b_disabled={false}
          b_handleApiCall={toggleLastAppendedLoraPopupOpen} b_icon={<BsFillFileEarmarkArrowUpFill />} isApiCall={true} />

        {/**Append Button */}
        <FunctionButton b_placement={"bottom"} b_tooltip={"Append to GoogleSheet"} b_variant={"success"} b_style={""} b_className={"popup-button"}
          b_disabled={fileName === "" || loraInfo === "" || loraURL === ""}
          b_handleApiCall={handleAppendIntoSheet} b_icon={<BsFillClipboard2PlusFill />} isApiCall={true} />

        {/**Remove & Unbookmark Button */}
        <FunctionButton b_placement={"bottom"} b_tooltip={"Remove & Unbookmark"} b_variant={"danger"} b_style={""} b_className={"popup-button"}
          b_disabled={fileName === "" || loraInfo === "" || loraURL === ""}
          b_handleApiCall={handleRemoveAndUnbookmark} b_icon={<GrClose />} isApiCall={true} />

        {/**download Button */}
        <FunctionButton b_placement={"bottom"} b_tooltip={"Download File"} b_variant={"primary"} b_style={""} b_className={"popup-button"}
          b_disabled={fileName === "" || downloadFilePath === null || downloadFilePath.length < 9 || downloadFilePath[0] !== "/"}
          b_handleApiCall={handleDownload} b_icon={<BsDownload />} isApiCall={true} />

        {/**Update Popup Button*/}
        <FunctionButton b_placement={"bottom"} b_tooltip={"Update Loras"} b_variant={"success"} b_style={""} b_className={"popup-button"}
          b_disabled={fileName === "" || loraInfo === "" || loraURL === ""}
          b_handleApiCall={toggleUpdateLoraPopupOpen} b_icon={<GrCopy />} isApiCall={true} />

        {/**Bookmark */}
        <FunctionButton b_placement={"bottom"} b_tooltip={"Bookmark"} b_variant={"primary"} b_style={""} b_className={"popup-button"}
          b_disabled={false}
          b_handleApiCall={handleToggleFavorite} b_icon={<BsStarFill />} b_icon_alter={<BsStar />} isApiCall={true} isFavorite={isFavorite} />

      </div>

      {/**ALL Button */}
      <div style={{ display: 'flex', justifyContent: 'center', padding: "5px" }}>
        <FunctionButton b_placement={"bottom"} b_tooltip={"Perform ALL"} b_variant={"primary"} b_style={{ width: "90%" }} b_className={"popup-button btn-lg"}
          b_disabled={fileName === "" || loraInfo === "" || loraURL === "" || downloadFilePath === null || downloadFilePath.length < 9 || downloadFilePath[0] !== "/"}
          b_handleApiCall={handleAll} b_icon={<SiTask />} isApiCall={true} />
      </div>

      {/**Error Alert*/}
      <Alert show={Object.keys(errorObj).length !== 0 ? true : false} variant="success" onClose={() => setErrorObj({})} dismissible>
        <p> <b> {errorObj.name}</b> {errorObj.message}</p>
      </Alert>

      {/**Similar Popup*/}
      {isSimilarLoraPopupOpen && <SimilarLoraPopup toggleSimilarLoraPopupOpen={toggleSimilarLoraPopupOpen} errorhandler={errorhandler}
        selectedSheet={selectedSheet} renderTooltip={renderTooltip} modelID={loraURL.match(/\/models\/(\d+)/)?.[1] || ''} />}

      {/**Update Popup*/}
      {isUpdateLoraPopupOpen && <UpdateLoraPopup toggleUpdateLoraPopupOpen={toggleUpdateLoraPopupOpen} errorhandler={errorhandler}
        selectedSheet={selectedSheet} modelID={loraURL.match(/\/models\/(\d+)/)?.[1] || ''}
        setdownloadFilePath={setdownloadFilePath} handleDownload={handleDownload}
        bookmarkId={bookmarkId} addBookmark={addBookmark} isFavorite={isFavorite}
        domData={domData} fileName={fileName} loraInfo={loraInfo} loraURL={loraURL} imagesArray={imagesArray} />}

      {/**Checking Popup*/}
      {isCheckingLoraPopupOpen && <CheckLoraPopup toggleCheckingLoraPopupOpen={toggleCheckingLoraPopupOpen} errorhandler={errorhandler}
        selectedSheet={selectedSheet} loraURL={loraURL} modelID={loraURL.match(/\/models\/(\d+)/)?.[1] || ''} />}

      {/**Last Append Popup*/}
      {isLastAppendedLoraPopupOpen && <LastAppendLoraPopup toggleLastAppendedLoraPopupOpen={toggleLastAppendedLoraPopupOpen} errorhandler={errorhandler} />}

      {/**Suggestion Panel*/}
      <SuggestionTagPanel setdownloadFilePath={setdownloadFilePath} loraURL={loraURL} renderTooltip={renderTooltip} errorhandler={errorhandler} />


      {/**Checkbox for Preventing modifying the Info*/}
      <div>
        <div>
          <Form.Check
            inline
            type="checkbox"
            id="disableInputsCheckbox"
            checked={isInputsDisabled}
            onChange={handleCheckboxChange}
            label="-Lora Model Info-"
          />
        </div>

        {/**AutoComplete Input*/}
        <AutocompleteInput setIsLoading={setIsLoading} isLoading={isLoading}
          downloadFilePath={downloadFilePath} setdownloadFilePath={setdownloadFilePath}
          renderTooltip={renderTooltip}
          setSelectedSheet={setSelectedSheet}
          selectedSheet={selectedSheet}
          sheetsList={sheetsList}
          errorhandler={errorhandler} />

        {/**File Name*/}
        <InputGroup className="mb-3">
          <FormControl
            placeholder="file name"
            value={fileName}
            onChange={(e) => setFilename(e.target.value)}
            disabled={isInputsDisabled}
          />
          <OverlayTrigger placement="bottom" overlay={renderTooltip('Get Lora Info')}>
            <Button variant="outline-secondary" disabled={isLoading} onClick={() => handleGettingLoraFileInfo()}>
              {isLoading || fileName === "" ? <BsArrowRepeat className="spinner" /> : <BsCheck />}
            </Button>
          </OverlayTrigger>
        </InputGroup>

        {/**File Info*/}
        <InputGroup className="mb-3">
          <FormControl
            placeholder="lora info"
            value={loraInfo}
            onChange={(e) => setLoraInfo(e.target.value)}
            disabled={isInputsDisabled}
          />
          <OverlayTrigger placement="bottom" overlay={renderTooltip('Get Lora Info')}>
            <Button variant="outline-secondary" disabled={isLoading} onClick={() => handleGettingDOMData()}>
              {isLoading || loraInfo === "" ? <BsArrowRepeat className="spinner" /> : <BsCheck />}
            </Button>
          </OverlayTrigger>
        </InputGroup>


        {/**File URL*/}
        <InputGroup className="mb-3">
          <FormControl
            placeholder="lora URL"
            value={loraURL}
            onChange={(e) => setLoraURL(e.target.value)}
            disabled={isInputsDisabled}
          />
          <OverlayTrigger placement="bottom" overlay={renderTooltip('Get Lora Info')}>
            <Button variant="outline-secondary" disabled={isLoading} onClick={() => handleGettingDOMData()}>
              {isLoading || loraURL === "" ? <BsArrowRepeat className="spinner" /> : <BsCheck />}
            </Button>
          </OverlayTrigger>
        </InputGroup>
      </div>


      {/**GoogleSheet List*/}
      <div className="sheet-selection d-flex align-items-center">
        <Form style={{ display: 'flex', alignItems: 'center' }}>
          <Form.Group controlId="selectSheet" className="mb-0 me-2">
            <Form.Label className="me-2">Select Sheet:</Form.Label>
            <Form.Select
              value={selectedSheet}
              onChange={handleSheetSelection}
              style={{ minWidth: '150px' }}
            >
              <option value="">Select an option</option>
              {sheetsList.map((sheet, index) => (
                <option key={index} value={sheet}>
                  {sheet}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
          <OverlayTrigger placement="top" overlay={renderTooltip('Get Lora Info')}>
            <Button variant="light" disabled={isLoading} style={{ marginTop: '35px' }} onClick={handleRefreshSheetList}>
              <BiRefresh />
            </Button>
          </OverlayTrigger>
        </Form>
      </div>

    </div >
  );
};


const root = createRoot(document.getElementById("root")!);

root.render(
  <React.StrictMode>
    <Popup />
  </React.StrictMode>
);
