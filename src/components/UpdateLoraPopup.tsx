import React, { useEffect, useState } from "react";
import axios from "axios"
import config from "../config/config.json"
import { Toast } from 'react-bootstrap';
import Col from 'react-bootstrap/Col';
import { BiUndo } from "react-icons/bi"
import FunctionButton from "./FunctionButton";
import { BsFillFileEarmarkArrowUpFill } from 'react-icons/bs';
import { Carousel } from 'react-bootstrap';

interface DomData {
    infoBlock: string;
    currentUrl: string;
    excelText: string;
    fileType: string;
    downloadLink: string;
    // Other properties if applicable
}


const UpdateLoraPopup = (props: any) => {
    const [isUpdateReady, setIsUpdateReady] = useState(false)
    const [docsUrl, setDocsUrl] = useState(props.currentUrl)
    const [docsArray, setDocsArray] = useState<{ name: string; url: string; images: { url: string; height: number; width: number; nsfw: string }[] }[]>([]);
    const [visibleToasts, setVisibleToasts] = useState<boolean[]>([])
    const [oldLoraFileName, setOldLoraFileName] = useState("")

    useEffect(() => {
        handleFindLoraByModelID()
    }, [])

    const handleAddFavorite = () => {
        console.log("Calling handleAddFavorite")
        if (!props.isFavorite) {
            props.addBookmark()
        }
    }

    const handleClose = (index: any) => {
        const newVisibleToasts = [...visibleToasts];
        newVisibleToasts[index] = false;
        setVisibleToasts(newVisibleToasts);
    };

    const handleFindLoraByModelID = async () => {
        console.log("Calling handleFindLoraByModelID");
        try {

            if (props.modelID === "") {
                return
            }

            const response = await axios.post(`${config.domain}/api/find-lora-by-modelID`, { data: { sheetName: props.selectedSheet, modelID: props.modelID } });

            setDocsArray(response.data)
            setVisibleToasts(response.data.map(() => true))
        } catch (error: any) {
            console.error(error);
            props.errorhandler(error)
        }
    };

    const handleUpdateLora = async (docsUrl: any, oldLoraFileName: any) => {
        console.log("Calling handleupdate")
        setDocsUrl(docsUrl)
        setOldLoraFileName(oldLoraFileName)
        props.setdownloadFilePath('/@scan@/Update/');
        setIsUpdateReady(true)
    }

    useEffect(() => {
        if (isUpdateReady) {
            props.handleDownload()

            const callUpdateSheetAPI = async () => {
                console.log("Calling handleCallUpdateSheetAPI")
                let { infoBlock, currentUrl } = props.domData as DomData;
                let loraFileName = props.fileName;
                try {
                    const response = await axios.post(`${config.domain}/api/update-sheet`,
                        {
                            data: {
                                selectedSheet: props.selectedSheet, loraFileName: loraFileName, infoBlock: infoBlock,
                                currentUrl: currentUrl, docsUrl: docsUrl, oldLoraFileName: oldLoraFileName, imagesArray: props.imagesArray
                            }
                        });
                    handleAddFavorite()
                    props.toggleUpdateLoraPopupOpen()
                } catch (error: any) {
                    console.error(error);
                    props.errorhandler(error)
                }
            }

            callUpdateSheetAPI()

            setIsUpdateReady(false)
        }
    }, [isUpdateReady])

    return (
        <div
            style={{
                position: "fixed",
                top: 0,
                right: 0,
                left: 0,
                bottom: 0,
                background: "rgba(0, 0, 0, 0.5)",
                zIndex: 9999,
                display: "flex",
                justifyContent: "flex-end",
                alignItems: "flex-start",
                padding: "10px",
            }}
        >
            <button
                style={{
                    position: "absolute",
                    top: "10px",
                    right: "30px",
                    padding: "5px",
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "20px",
                    color: "black",
                }}
                onClick={props.toggleUpdateLoraPopupOpen}
            >
                <BiUndo />
            </button>

            <div
                style={{
                    background: "#f1f1f1",
                    boxShadow: "0 0 5px rgba(0, 0, 0, 0.3)",
                    padding: "10px",
                    margin: "10px",
                    minWidth: "95%",
                    minHeight: "95%",
                    overflowY: "auto", // Add this line to make the container scrollable with vertical scrollbar
                    maxHeight: "80vh", // Set a fixed height to enable the scrollbar when content exceeds this height
                }}
            >

                <center><h5> {props.selectedSheet}</h5></center>
                <div style={{ display: 'flex', justifyContent: 'center', padding: "1px" }}>
                    <h6>Available Update Lora : {visibleToasts.filter(Boolean).length}</h6>
                </div>

                <hr />

                {visibleToasts.every((e) => e === false) && <div style={{ display: 'flex', justifyContent: 'center', padding: "5px" }}> EMPTY :P</div>}

                {docsArray?.map((doc, index) => {
                    if (!visibleToasts[index]) return null; // Hide the toast if the flag is false

                    return (
                        <div key={index} style={{ padding: "5px", margin: "3px" }}>
                            <Toast onClose={() => handleClose(index)}>
                                <Toast.Header>
                                    <Col xs={10} style={{ overflowWrap: "break-word" }}>
                                        <strong>{doc.name}</strong>
                                    </Col>
                                </Toast.Header>
                                <div style={{ display: 'flex', justifyContent: 'center', padding: "1px" }}>
                                    {doc.images[0]?.url ?
                                        <Carousel fade>
                                            {doc.images?.map((image) => {
                                                return <Carousel.Item>
                                                    <img
                                                        style={{ width: '200px', height: '250px', objectFit: 'cover' }}
                                                        src={image.url ? image.url : "https://placehold.co/200x250"}
                                                        alt={doc.name}
                                                    />
                                                </Carousel.Item>
                                            })}
                                        </Carousel> :
                                        <img
                                            style={{ width: '200px', height: '250px', objectFit: 'cover' }}
                                            src={"https://placehold.co/200x250"}
                                            alt={doc.name}
                                        />}
                                </div>
                                <Toast.Body><a href={doc.url}> {doc.url} </a></Toast.Body>

                                {/**Update Button */}
                                <div style={{ display: 'flex', justifyContent: 'center', padding: "5px" }}>
                                    <FunctionButton b_placement={"bottom"} b_tooltip={"Update"} b_variant={"primary"} b_style={{ width: "90%" }} b_className={"popup-button btn-lg"}
                                        b_disabled={props.fileName === "" || props.loraInfo === "" || props.loraURL === ""}
                                        b_handleApiCall={() => handleUpdateLora(doc.url, doc.name)} b_icon={<BsFillFileEarmarkArrowUpFill />} isApiCall={true} />
                                </div>

                            </Toast>
                        </div>
                    )
                })}
            </div>
        </div>
    );
};

export default UpdateLoraPopup;
