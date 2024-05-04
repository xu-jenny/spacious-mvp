"use client";

import { Modal as FbModal } from "flowbite-react";
import { SetStateAction } from "react";

type Props = {
  header: string;
  content: React.ReactNode;
  footer: React.ReactNode;
  openModal: boolean | undefined;
  setOpenModal: (value: SetStateAction<boolean>) => void;
};

const Modal = ({ header, content, footer, openModal, setOpenModal }: Props) => {
  return (
    <>
      <FbModal dismissible show={openModal} onClose={() => setOpenModal(false)}>
        <FbModal.Header>{header}</FbModal.Header>
        <FbModal.Body>{content}</FbModal.Body>
        <FbModal.Footer>{footer}</FbModal.Footer>
      </FbModal>
    </>
  );
};
export default Modal;
