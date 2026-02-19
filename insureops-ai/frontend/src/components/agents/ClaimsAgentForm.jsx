import DynamicClaimWizard from '../claims/DynamicClaimWizard';

const ClaimsAgentForm = ({ onSubmit }) => {
    return (
        <DynamicClaimWizard onSubmit={onSubmit} />
    );
};

export default ClaimsAgentForm;
