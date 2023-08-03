import React, { useEffect, useState } from "react";
import axios from "axios"
import config from "../config/config.json"
import { Toast } from 'react-bootstrap';
import { Carousel } from 'react-bootstrap';
import Col from 'react-bootstrap/Col';
import { BiUndo } from "react-icons/bi"
import { Button, FormControl, InputGroup, OverlayTrigger } from 'react-bootstrap';
import { BsCheck, BsArrowRepeat } from 'react-icons/bs';


const SimilarLoraPopup = (props: any) => {

    const [civitaiTitlesCombiation, setCivitaiTitleCombination] = useState<{ name: string; value: string; }[]>([]);
    const [currentCivitaiTitle, setcurrentCivitaiTitle] = useState("");
    const [docsArray, setDocsArray] = useState<{ name: string; url: string; images: { url: string; height: number; width: number; nsfw: string }[] }[]>([]);
    const [visibleToasts, setVisibleToasts] = useState<boolean[]>([])
    const [isLoading, setIsLoading] = useState(false)

    const checkPossibleCombination = async (fullTitle: any) => {
        console.log("Calling checkPossibleCombination")
        try {

            const ary = fullTitle.split(" ");

            const fary = [];

            for (let i = 0; i < ary.length; i++) {
                for (let j = i + 1; j <= ary.length; j++) {
                    const subArray = ary.slice(i, j);
                    if (subArray.length > 1 && subArray.length < 50) {
                        fary.push(subArray.join(" "));
                    }
                }
            }

            let nary = []

            for (let e of ary) {
                let cut = e.replace(/[()]/g, '')
                if (cut.length > 2) {
                    nary.push(cut.toLowerCase())
                }
            }
            for (let e of fary) {
                let temp = e.split(" ");
                let cut = temp[0].replace(/[()]/g, '')
                if (cut.length > 2) {
                    nary.push(cut.toLowerCase())
                }
            }

            // Convert the array to a Set to remove duplicates
            const uniqueStringSet = new Set(nary);

            // Convert the Set back to an array
            const uniqueStringArray = Array.from(uniqueStringSet);


            let possibleCombiation = uniqueStringArray.map((title: any) => {
                return {
                    "name": title.toLowerCase().charAt(0).toUpperCase() + title.slice(1),
                    "value": title.toLowerCase().charAt(0).toUpperCase() + title.slice(1)
                }
            })

            if (possibleCombiation.length > 30) {
                possibleCombiation = possibleCombiation.slice(0, 30)
            }

            const response = await axios.post(`${config.domain}/api/list-suggestionTags`, { data: { modelID: props.modelID } });

            let suggestionTagsArray = await response.data.map((obj: any) => {
                return {
                    "name": obj.name.split(' ')
                        .map((word: String) => word.toLowerCase().charAt(0).toUpperCase() + word.slice(1))
                        .join(' '),
                    "value": obj.value.split(' ')
                        .map((word: String) => word.toLowerCase().charAt(0).toUpperCase() + word.slice(1))
                        .join(' ')
                }
            })


            let finalArray = removeDuplicatesByProperty(possibleCombiation.concat(suggestionTagsArray), "name")

            setCivitaiTitleCombination(finalArray)

        } catch (error: any) {
            console.error(error);
            props.errorhandler(error)
        }

    }

    function removeDuplicatesByProperty(arr: any, property: string) {
        const seen = new Set();
        return arr.filter((item: any) => {
            const propertyValue = item[property];
            if (!seen.has(propertyValue)) {
                seen.add(propertyValue);
                return true;
            }
            return false;
        });
    }

    useEffect(() => {
        handleGetFullTitle()
    }, []);


    const handleSetCurrentTitle = (title: any) => {
        console.log("Calling handleSetCurrentTitle");
        if (currentCivitaiTitle === title) {
            //turn off button 
            setcurrentCivitaiTitle("")
            handleFindLoraByTitle("");
        } else {
            //turn on button 
            setcurrentCivitaiTitle(title);
            handleFindLoraByTitle(title);
        }
    };

    const handleFindLoraByTitle = async (title: any) => {
        console.log("Calling handleFindLoraByTitle");
        setIsLoading(true)
        try {
            if (title === "") {
                setDocsArray([])
                setVisibleToasts([].map(() => true))
                return
            }

            const response = await axios.post(`${config.domain}/api/find-lora-by-title`, { data: { sheetName: props.selectedSheet, title: title } });
            setDocsArray(response.data)
            setVisibleToasts(response.data.map(() => true))
            setIsLoading(false)
        } catch (error: any) {
            console.error(error);
            props.errorhandler(error)
        }
    };

    const handleGetFullTitle = async () => {
        console.log("Calling handleGetFullTitle");
        try {
            const civitai_api = `https://civitai.com/api/v1/models/${props.modelID}`;
            const response = await axios.get(civitai_api);
            const { name } = response.data;
            await checkPossibleCombination(name)
        } catch (error: any) {
            console.error(error);
            props.errorhandler(error)
        }
    }

    const handleClose = (index: any) => {
        const newVisibleToasts = [...visibleToasts];
        newVisibleToasts[index] = false;
        setVisibleToasts(newVisibleToasts);
    };


    const unClickedButtonStyle = {
        margin: '3px',
        padding: '5px',
        fontSize: "12px",
        backgroundColor: 'rgb(44, 47, 49)',
        cursor: "pointer",
        color: 'rgb(232, 230, 227)',
        borderColor: 'transparent',
        borderRadius: '10px', // Rounded corners
    };

    const clickedButtonStyle = {
        margin: '3px',
        padding: '5px',
        fontSize: "12px",
        backgroundColor: 'rgb(232, 230, 227)',
        cursor: "pointer",
        color: 'rgb(44, 47, 49)',
        borderColor: 'transparent',
        borderRadius: '10px', // Rounded corners
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
                onClick={props.toggleSimilarLoraPopupOpen}
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
                    <h6>Saved Lora : {visibleToasts.filter(Boolean).length}</h6>
                </div>

                <hr />

                {/**File Name*/}
                <InputGroup className="mb-3">
                    <FormControl
                        placeholder="file name"
                        value={currentCivitaiTitle}
                        onChange={(e) => setcurrentCivitaiTitle(e.target.value)}
                    />
                    <OverlayTrigger placement="bottom" overlay={props.renderTooltip('Find Lora')}>
                        <Button variant="outline-secondary" disabled={isLoading} onClick={() => handleFindLoraByTitle(currentCivitaiTitle)}>
                            {isLoading ? <BsArrowRepeat className="spinner" /> : <BsCheck />}
                        </Button>
                    </OverlayTrigger>
                </InputGroup>


                {civitaiTitlesCombiation.map((title, index) => (
                    <label key={index} onClick={() => handleSetCurrentTitle(title.value)} style={title.value === currentCivitaiTitle ? clickedButtonStyle : unClickedButtonStyle}>
                        {title.name}
                    </label>
                ))}

                <div style={{ display: 'flex', justifyContent: 'center', padding: "1px" }}>
                    <h6>Available Update Lora : {visibleToasts.filter(Boolean).length}</h6>
                </div>

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
                            </Toast>
                        </div>
                    )
                })}
            </div>
        </div>
    );
};

export default SimilarLoraPopup;
