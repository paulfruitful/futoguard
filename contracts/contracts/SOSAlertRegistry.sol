// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract SOSAlertRegistry {
    struct AlertMetadata {
        string alertId;
        uint256 timestamp;
        bytes32 locationHash;
    }
    
    mapping(string => AlertMetadata) private alerts;
    string[] private alertIds;
    
    event AlertLogged(string indexed alertId, uint256 timestamp, bytes32 locationHash);
    
    function logSOSAlert(string memory alertId, uint256 timestamp, bytes32 locationHash) external {
        require(bytes(alertId).length > 0, "Alert ID cannot be empty");
        require(timestamp > 0, "Timestamp must be valid");
        
        alerts[alertId] = AlertMetadata(alertId, timestamp, locationHash);
        alertIds.push(alertId);
        
        emit AlertLogged(alertId, timestamp, locationHash);
    }
    
    function getAlert(string memory alertId) external view returns (string memory, uint256, bytes32) {
        AlertMetadata memory alert = alerts[alertId];
        require(bytes(alert.alertId).length > 0, "Alert not found");
        
        return (alert.alertId, alert.timestamp, alert.locationHash);
    }
    
    function getAlertCount() external view returns (uint256) {
        return alertIds.length;
    }
}