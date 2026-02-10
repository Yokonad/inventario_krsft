import { createPortal } from 'react-dom';
import { ModalVerifyCheckIcon, UserIcon, CheckIcon } from '../Icons';

/**
 * Small centered modal to confirm material verification.
 */
export default function VerifyModal({
    verifyingProduct,
    currentUserName,
    confirmVerify, closeVerifyModal,
}) {
    return createPortal(
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) closeVerifyModal(); }}>
            <div className="modal-verify">
                <div className="modal-verify-icon">
                    {ModalVerifyCheckIcon}
                </div>
                <h3 className="modal-verify-title">Verificar Material</h3>
                <p className="modal-verify-text">¿Confirmas la verificación de:</p>
                <div className="modal-verify-product">{verifyingProduct?.nombre}</div>
                <div className="modal-verify-user">
                    {UserIcon}
                    <span>{currentUserName}</span>
                </div>
                <div className="modal-verify-actions">
                    <button type="button" onClick={closeVerifyModal} className="btn-verify-cancel">Cancelar</button>
                    <button type="button" onClick={confirmVerify} className="btn-verify-confirm">
                        {CheckIcon}
                        Verificar
                    </button>
                </div>
            </div>
        </div>,
        document.body,
    );
}
