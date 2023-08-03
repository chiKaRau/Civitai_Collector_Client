import React, { useEffect, useState } from "react";
import axios from "axios"
import config from "../config/config.json"
import { Toast } from 'react-bootstrap';
import Col from 'react-bootstrap/Col';
import { BiUndo } from "react-icons/bi"
import FunctionButton from "./FunctionButton";
import { BsFillFileEarmarkArrowUpFill } from 'react-icons/bs';
import { Carousel } from 'react-bootstrap';

const LastAppendLoraPopup = (props: any) => {

    useEffect(() => {
        handleFindLastAppendedDocs()
    }, [])

    const handleFindLastAppendedDocs = async () => {
        console.log("Calling handleFindLoraByModelID");
        try {
            const response = await axios.get(`${config.domain}/api/find-last-appended-docs`);

            console.log(response)
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
                onClick={props.toggleLastAppendedLoraPopupOpen}
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
                <div style={{ display: 'flex', justifyContent: 'center', padding: "1px" }}>
                    <h6>Last Appended Collection's Doc</h6>
                </div>

                <hr />

            </div>
        </div>
    );
};

export default LastAppendLoraPopup;
