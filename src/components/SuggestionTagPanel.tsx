import React, { useEffect, useState } from 'react';
import { Collapse, OverlayTrigger } from 'react-bootstrap';
import axios from "axios"

import config from "../config/config.json"
import data from "../data/data.json"

const SuggestionTagPanel = (props: any) => {
    const [open, setOpen] = useState(false);
    const [defaultSuggestionTags, setDefaultSuggestionTags] = useState<{ name: string; value: string; }[]>(data.defaultSuggestionTagsObjList);
    const [civitaiSuggestionTags, setCivitaiSuggestionTags] = useState<{ name: string; value: string; }[]>([]);
    const [currentTypeTag, setcurrentTypeTag] = useState("");
    const [currentCivitaiTag, setcurrentCivitaiTag] = useState("");

    const handleToggle = () => {
        setOpen(!open);
        if (civitaiSuggestionTags.length < 1) {
            handleGettingCivitaiSuggestionTags()
        }

    };

    const handleGettingCivitaiSuggestionTags = async () => {
        console.log("Calling handleAppendIntoSheet")
        const modelID = props.loraURL.match(/\/models\/(\d+)/)?.[1] || '';
        try {
            const response = await axios.post(`${config.domain}/api/list-suggestionTags`, { data: { modelID: modelID } });
            let suggestionTagsArray = response.data.map((obj: any) => {
                return {
                    "name": obj.name.split(' ')
                        .map((word: String) => word.toLowerCase().charAt(0).toUpperCase() + word.slice(1))
                        .join(' '),
                    "value": obj.value.split(' ')
                        .map((word: String) => word.toLowerCase().charAt(0).toUpperCase() + word.slice(1))
                        .join(' ')
                }
            })
            setCivitaiSuggestionTags(suggestionTagsArray)
        } catch (error: any) {
            console.error(error);
            props.errorhandler(error)
        }
    };

    const handleSetCurrentTypeTag = (tag: any) => {
        if (currentTypeTag === tag) {
            setcurrentTypeTag("")
        } else {
            setcurrentTypeTag(tag);
        }
    };

    const handleSetCurrentCivitaiTag = (tag: any) => {
        if (currentCivitaiTag === tag) {
            setcurrentCivitaiTag("")
        } else {
            setcurrentCivitaiTag(tag);
        }
    };

    useEffect(() => {
        props.setdownloadFilePath(`${currentTypeTag}${currentCivitaiTag}`)
    }, [currentTypeTag, currentCivitaiTag])

    const panelStyle = {
        border: '1px solid #ccc',
        backgroundColor: '#f8f8f8',
        padding: '10px',
        margin: '10px',
        borderRadius: '10px', // Rounded corners
    };

    const toggleStyle = {
        marginBottom: '10px',
        cursor: 'pointer',
        fontSize: "15px",
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
        <div style={panelStyle}>
            <div style={toggleStyle} onClick={handleToggle} aria-controls="collapse-panel" aria-expanded={open}>
                Folder Suggestions
            </div>
            <hr />

            <Collapse in={open}>
                <div id="collapse-panel">
                    {defaultSuggestionTags.map((tag, index) => (
                        <OverlayTrigger placement="bottom" overlay={props.renderTooltip(tag.value)}>
                            <label key={index} onClick={() => handleSetCurrentTypeTag(tag.value)} style={tag.value === currentTypeTag ? clickedButtonStyle : unClickedButtonStyle}>
                                {tag.name}
                            </label>
                        </OverlayTrigger>
                    ))}

                    <p style={{ fontSize: "15px" }}> Civitai Suggestions </p>
                    <hr />

                    {civitaiSuggestionTags.map((tag, index) => (
                        <OverlayTrigger placement="bottom" overlay={props.renderTooltip(tag.value)}>
                            <label key={index} onClick={() => handleSetCurrentCivitaiTag(tag.value)} style={tag.value === currentCivitaiTag ? clickedButtonStyle : unClickedButtonStyle}>
                                {tag.name}
                            </label>
                        </OverlayTrigger>
                    ))}
                </div>
            </Collapse >
        </div >
    );
};

export default SuggestionTagPanel;
