import { createPortal } from 'react-dom';
import { ModalVerifyCheckIcon, UserIcon, CheckIcon } from '../Icons';
import { MODAL_CLASSES, BUTTON_CLASSES } from '../../tokens';

/**
 * Small centered modal to confirm material verification.
 * Styles: Tailwind CSS via tokens.js (NO CSS files).
 */
export default function VerifyModal({
    verifyingProduct,
    currentUserName,
    confirmVerify, closeVerifyModal,
}) {
    return createPortal(
        <div className={MODAL_CLASSES.overlay} onClick={(e) => { if (e.target === e.currentTarget) closeVerifyModal(); }}>
            <div className={MODAL_CLASSES.verify}>
                <div className={MODAL_CLASSES.verify_icon}>
                    {ModalVerifyCheckIcon}
                </div>
                <h3 className={MODAL_CLASSES.verify_title}>Verificar Material</h3>
                <p className={MODAL_CLASSES.verify_text}>¿Confirmas la verificación de:</p>
                <div className={MODAL_CLASSES.verify_product}>{verifyingProduct?.nombre}</div>
                <div className={MODAL_CLASSES.verify_user}>
                    {UserIcon}
                    <span>{currentUserName}</span>
                </div>
                <div className={MODAL_CLASSES.verify_actions}>
                    <button
                        type="button"
                        onClick={closeVerifyModal}
                        className={BUTTON_CLASSES.secondary}
                    >
                        Cancelar
                    </button>
                    <button
                        type="button"
                        onClick={confirmVerify}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition-colors duration-200 cursor-pointer border-0"
                    >
                        {CheckIcon}
                        Verificar
                    </button>
                </div>
            </div>
        </div>,
        document.body,
    );
}
