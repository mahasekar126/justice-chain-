// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

contract JusticeChain {
    enum Role { None, Admin, Police, Lawyer, Judge, Clerk }
    enum CaseStatus { Open, Pending, Closed }

    struct Evidence {
        string hash;
        string description;
        address addedBy;
        uint timestamp;
    }

    struct Case {
        uint id;
        string title;
        string description;
        string victimName;
        string accusedName;
        string location;
        string incidentDetails;
        address createdBy;
        uint createdAt;
        uint lastUpdated;
        CaseStatus status;
        Evidence[] evidences;
        string judgment;
        uint judgmentDate;
    }

    mapping(address => Role) public roles;
    mapping(uint => Case) public cases;
    uint public caseCounter;

    event CaseCreated(uint indexed caseId, string title, address createdBy);
    event CaseUpdated(uint indexed caseId, string description);
    event EvidenceAdded(uint indexed caseId, string hash);
    event CaseStatusChanged(uint indexed caseId, CaseStatus status);
    event JudgmentAdded(uint indexed caseId, string judgment, uint judgmentDate);

    modifier onlyRole(Role _role) {
        require(roles[msg.sender] == _role, "Not authorized");
        _;
    }

    modifier caseExists(uint _id) {
        require(cases[_id].id != 0, "Case not found");
        _;
    }

    constructor() {
        roles[msg.sender] = Role.Admin;
    }

    function assignRole(address user, Role _role) public onlyRole(Role.Admin) {
        roles[user] = _role;
    }

    function createCase(
        string memory _title,
        string memory _description,
        string memory _victimName,
        string memory _accusedName,
        string memory _location,
        string memory _incidentDetails
    ) public onlyRole(Role.Admin) {
        caseCounter++;
        Case storage newCase = cases[caseCounter];
        newCase.id = caseCounter;
        newCase.title = _title;
        newCase.description = _description;
        newCase.victimName = _victimName;
        newCase.accusedName = _accusedName;
        newCase.location = _location;
        newCase.incidentDetails = _incidentDetails;
        newCase.createdBy = msg.sender;
        newCase.createdAt = block.timestamp;
        newCase.lastUpdated = block.timestamp;
        newCase.status = CaseStatus.Open;

        emit CaseCreated(caseCounter, _title, msg.sender);
    }

    function updateCase(uint _id, string memory _description) public onlyRole(Role.Admin) caseExists(_id) {
        Case storage c = cases[_id];
        c.description = _description;
        c.lastUpdated = block.timestamp;

        emit CaseUpdated(_id, _description);
    }

    function addEvidence(uint _caseId, string memory _hash, string memory _description) public caseExists(_caseId) {
        require(
            roles[msg.sender] == Role.Admin ||
            roles[msg.sender] == Role.Police ||
            roles[msg.sender] == Role.Lawyer,
            "Only Admin, Police, or Lawyer can add evidence"
        );
        Case storage c = cases[_caseId];
        c.evidences.push(Evidence(_hash, _description, msg.sender, block.timestamp));
        c.lastUpdated = block.timestamp;

        emit EvidenceAdded(_caseId, _hash);
    }

    function updateCaseStatus(uint _id, CaseStatus _status) public caseExists(_id) {
        require(
            roles[msg.sender] == Role.Admin ||
            roles[msg.sender] == Role.Judge,
            "Only Admin or Judge can update case status"
        );
        Case storage c = cases[_id];
        c.status = _status;
        c.lastUpdated = block.timestamp;

        emit CaseStatusChanged(_id, _status);
    }

    function getCaseDetail(uint _id) public view caseExists(_id) returns (
        uint id,
        string memory title,
        string memory description,
        string memory victimName,
        string memory accusedName,
        string memory location,
        string memory incidentDetails,
        address createdBy,
        uint createdAt,
        uint lastUpdated,
        CaseStatus status,
        uint evidenceCount,
        string memory judgment,
        uint judgmentDate
    ) {
        Case storage c = cases[_id];
        return (
            c.id,
            c.title,
            c.description,
            c.victimName,
            c.accusedName,
            c.location,
            c.incidentDetails,
            c.createdBy,
            c.createdAt,
            c.lastUpdated,
            c.status,
            c.evidences.length,
            c.judgment,
            c.judgmentDate
        );
    }

    function getEvidence(uint _caseId, uint _evidenceIndex) public view caseExists(_caseId) returns (
        string memory hash,
        string memory description,
        address addedBy,
        uint timestamp
    ) {
        require(_evidenceIndex < cases[_caseId].evidences.length, "Evidence index out of bounds");
        Evidence storage e = cases[_caseId].evidences[_evidenceIndex];
        return (e.hash, e.description, e.addedBy, e.timestamp);
    }

    function getEvidenceCount(uint _caseId) public view caseExists(_caseId) returns (uint) {
        return cases[_caseId].evidences.length;
    }

    function addJudgment(uint _id, string memory _judgment, uint _judgmentDate) public caseExists(_id) {
        require(
            roles[msg.sender] == Role.Admin ||
            roles[msg.sender] == Role.Judge,
            "Only Admin or Judge can add judgment"
        );
        Case storage c = cases[_id];
        c.judgment = _judgment;
        c.judgmentDate = _judgmentDate;
        c.lastUpdated = block.timestamp;

        emit JudgmentAdded(_id, _judgment, _judgmentDate);
    }

    function checkStaleCase(uint _id) public view caseExists(_id) returns (bool) {
        return (block.timestamp - cases[_id].lastUpdated > 35 days);
    }
}
