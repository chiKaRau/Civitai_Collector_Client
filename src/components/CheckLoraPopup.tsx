import React, { useEffect, useState } from "react";
import axios from "axios"
import config from "../config/config.json"
import { Toast } from 'react-bootstrap';
import Col from 'react-bootstrap/Col';
import { BiUndo } from "react-icons/bi"
import FunctionButton from "./FunctionButton";
import { BsFillFileEarmarkArrowUpFill } from 'react-icons/bs';
import { Carousel } from 'react-bootstrap';

const CheckLoraPopup = (props: any) => {

    const [docsArray, setDocsArray] = useState<{ name: string; url: string; row_id: number; images: { url: string; height: number; width: number; nsfw: string }[] }[]>([]);
    const [visibleToasts, setVisibleToasts] = useState<boolean[]>([])

    useEffect(() => {
        handleFindLoraByURL()
    }, [])

    const handleClose = (index: any) => {
        const newVisibleToasts = [...visibleToasts];
        newVisibleToasts[index] = false;
        setVisibleToasts(newVisibleToasts);
    };

    const handleFindLoraByURL = async () => {
        console.log("Calling handleFindLoraByURL");
        try {

            if (props.loraURL === "") {
                return
            }

            const response = await axios.post(`${config.domain}/api/find-lora-by-url`, { data: { sheetName: props.selectedSheet, loraURL: props.loraURL } });

            setDocsArray(response.data)
            setVisibleToasts(response.data.map(() => true))
        } catch (error: any) {
            console.error(error);
            props.errorhandler(error)
        }
    };

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
                onClick={props.toggleCheckingLoraPopupOpen}
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
                    <h6>Current Lora in Docs</h6>
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
                                <Toast.Body>
                                    <p>row_id: {doc.row_id}</p>
                                    <a href={doc.url}> {doc.url} </a>
                                </Toast.Body>

                            </Toast>
                        </div>
                    )
                })}
            </div>
        </div>
    );
};

export default CheckLoraPopup;
