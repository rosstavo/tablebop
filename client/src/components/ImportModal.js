import React, {useState} from 'react';

/**
 * Base Web
 */
import { FileUploader } from "baseui/file-uploader";
import { Modal, ModalHeader, ModalBody, SIZE, ROLE } from "baseui/modal";
import { KIND as ButtonKind } from "baseui/button";

import { useRoom } from '../contexts/RoomProvider.js';

export default function ImportModal(props) {

    const { isImportModalOpen, setIsImportModalOpen } = useRoom();
    
    return (
        <Modal
            onClose={() => setIsImportModalOpen(false)}
            closeable
            isOpen={isImportModalOpen}
            animate
            autoFocus
            size={SIZE.default}
            role={ROLE.dialog}
        >
            <ModalHeader>Import (.json)</ModalHeader>
            <ModalBody>
                <FileUploader
                    accept="application/json"
                    maxSize={10000}
                    onDrop={
                        (acceptedFiles, rejectedFiles) => {
                            
                            const reader = new FileReader();

                            reader.addEventListener('load', (event) => {

                                console.log(JSON.parse(event.target.result));

                                props.dispatch( {
                                    type: 'importList',
                                    payload: {
                                        mediaList: JSON.parse(event.target.result)
                                    }
                                } );

                                setIsImportModalOpen(false);
                            });

                            reader.readAsText(acceptedFiles[0])

                        }
                    }
                />
            </ModalBody>
        </Modal>
    );
}