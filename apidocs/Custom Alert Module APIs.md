# Get Available Custom Alert Parameters

Returns all available GPS parameters, supported operators, subrule logic choices, and configuration metadata required by the frontend to build custom alert rules.

This API is typically used to populate:

- Parameter dropdown
    
- Operator dropdown
    
- Rule logic selector (AND / OR)
    
- Dynamic form validation
    

---

## Endpoint

``` http
GET /api/custom-alerts/parameters/

 ```

---

## Permissions

| Role | Access |
| --- | --- |
| Super Admin | Yes |
| State Admin | Yes |

Authentication is required.

``` http
Authorization: Bearer <access_token>

 ```

---

## Request Headers

| Header | Value |
| --- | --- |
| Authorization | Bearer |

---

## Example Request

``` http
GET /api/custom-alerts/parameters/

 ```

---

## Success Response

**Status Code:** `200 OK`

``` json
{
    "success": true,
    "message": "Alert parameters fetched successfully",
    "data": {
        "parameters": [
            {
                "code": "speed",
                "label": "Speed",
                "field_type": "numeric",
                "operators": [
                    {
                        "value": "==",
                        "label": "Equal to (==)"
                    },
                    {
                        "value": "!=",
                        "label": "Not equal to (!=)"
                    },
                    {
                        "value": ">",
                        "label": "Greater than (>)"
                    },
                    {
                        "value": ">=",
                        "label": "Greater than or equal to (>=)"
                    },
                    {
                        "value": "<",
                        "label": "Less than (<)"
                    },
                    {
                        "value": "<=",
                        "label": "Less than or equal to (<=)"
                    },
                    {
                        "value": "in_range",
                        "label": "In range (start–end)"
                    }
                ]
            }
        ],
        "subrule_logic_choices": [
            {
                "value": "AND",
                "label": "AND — all subrules must match"
            },
            {
                "value": "OR",
                "label": "OR — any subrule must match"
            }
        ],
        "max_subrules": 4
    }
}

 ```

---

## Response Structure

### Parameters

| Field | Type | Description |
| --- | --- | --- |
| code | string | Internal parameter code |
| label | string | Display name |
| field_type | string | `numeric` or `text` |
| operators | array | Supported operators for the parameter |

---

### Operator Object

| Field | Type | Description |
| --- | --- | --- |
| value | string | Operator value |
| label | string | Operator display label |

---

### Subrule Logic Choices

| Value | Description |
| --- | --- |
| AND | All subrules must evaluate to true |
| OR | At least one subrule must evaluate to true |

---

### Max Subrules

``` json
{
    "max_subrules": 4
}

 ```

Maximum number of subrules allowed in a single custom alert rule.

---

## Available Numeric Parameters

``` text
speed
altitude
satellites
pdop
hdop
heading
odometer
main_input_voltage
internal_battery_voltage
frame_number

 ```

---

## Available Text Parameters

``` text
packet_type
alert_id
packet_status
gps_status
ignition_status
main_power_status
emergency_status
box_tamper_alert
network_operator
gsm_signal_strength
digital_input_status
digital_output_status

 ```

---

## Numeric Operators

| Value | Description |
| --- | --- |
| \== | Equal to |
| != | Not equal to |
| \> | Greater than |
| \>= | Greater than or equal to |
| < | Less than |
| <= | Less than or equal to |
| in_range | Value lies within a range |

---

## Text Operators

| Value | Description |
| --- | --- |
| \== | Equal to |
| != | Not equal to |
| contains | Contains text |
| not_contains | Does not contain text |

---

## Frontend Usage Example

### Speed Parameter

``` json
{
    "code": "speed",
    "label": "Speed",
    "field_type": "numeric"
}

 ```

Frontend should display:

- Numeric input field
    
- Numeric operators only
    

---

### Ignition Status Parameter

``` json
{
    "code": "ignition_status",
    "label": "Ignition Status",
    "field_type": "text"
}

 ```

Frontend should display:

- Text input field
    
- Text operators only
    

---

## Error Response

``` json
{
    "success": false,
    "message": "Authentication credentials were not provided.",
    "errors": {}
}

 ```









 # Create Custom Alert Rule

Creates a new custom alert rule with one or more subrules. These rules are automatically evaluated against incoming GPS packets and generate alerts when configured conditions are satisfied.

---

## Endpoint

``` http
POST /api/custom-alerts/rules/

 ```

---

## Permissions

| Role | Access |
| --- | --- |
| Super Admin | Yes |
| State Admin | Yes |

Authentication is required.

``` http
Authorization: Bearer <access_token>

 ```

---

## Request Headers

| Header | Value |
| --- | --- |
| Content-Type | application/json |
| Authorization | Bearer |

---

## Request Body

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| name | string | Yes | Alert rule name |
| description | string | No | Rule description |
| status | string | Yes | `active` or `inactive` |
| subrule_logic | string | Yes | `AND` or `OR` |
| time_from | string | No | Rule-level start time (`HH:MM:SS`) |
| time_to | string | No | Rule-level end time (`HH:MM:SS`) |
| subrules | array | Yes | List of subrules |

---

## Subrule Object

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| order | integer | Yes | Execution order (1–4) |
| parameter | string | Yes | GPS field to evaluate |
| operator | string | Yes | Comparison operator |
| value | string | Conditional | Used for single-value comparisons |
| value_start | string | Conditional | Required for `in_range` operator |
| value_end | string | Conditional | Required for `in_range` operator |
| time_from | string | No | Subrule-level start time |
| time_to | string | No | Subrule-level end time |

---

## Example Request

``` json
{
    "name": "High Speed Alert",
    "description": "Fires when speed exceeds 80",
    "status": "active",
    "subrule_logic": "AND",
    "subrules": [
        {
            "order": 1,
            "parameter": "speed",
            "operator": ">",
            "value": "80",
            "value_start": "",
            "value_end": ""
        }
    ]
}

 ```

---

## Success Response

**Status Code:** `201 Created`

``` json
{
    "success": true,
    "message": "Custom alert rule created successfully",
    "data": {
        "id": 1,
        "name": "High Speed Alert",
        "description": "Fires when speed exceeds 80",
        "status": "active",
        "subrule_logic": "AND",
        "time_from": null,
        "time_to": null,
        "state": null,
        "subrules": [
            {
                "id": 1,
                "order": 1,
                "parameter": "speed",
                "operator": ">",
                "value": "80",
                "value_start": "",
                "value_end": "",
                "time_from": null,
                "time_to": null
            }
        ],
        "log_count": 0,
        "created_by": 1646,
        "created_by_name": "System Admin Test",
        "created_at": "2026-06-11T16:50:58.234256+05:30",
        "updated_at": "2026-06-11T16:50:58.234302+05:30"
    }
}

 ```

---

## Available Parameters

### Numeric Parameters

``` text
speed
altitude
satellites
pdop
hdop
heading
odometer
main_input_voltage
internal_battery_voltage
frame_number

 ```

### Text Parameters

``` text
packet_type
alert_id
packet_status
gps_status
ignition_status
main_power_status
emergency_status
box_tamper_alert
network_operator
gsm_signal_strength
digital_input_status
digital_output_status

 ```

---

## Supported Operators

### Numeric Parameters

``` text
==
!=
>
>=
<
<=
in_range

 ```

### Text Parameters

``` text
==
!=
contains
not_contains

 ```

---

## Example 1: High Speed Alert

``` json
{
    "name": "High Speed Alert",
    "status": "active",
    "subrule_logic": "AND",
    "subrules": [
        {
            "order": 1,
            "parameter": "speed",
            "operator": ">",
            "value": "80"
        }
    ]
}

 ```

---

## Example 2: Odometer Range Alert

``` json
{
    "name": "Odometer Range Alert",
    "status": "active",
    "subrule_logic": "AND",
    "subrules": [
        {
            "order": 1,
            "parameter": "odometer",
            "operator": "in_range",
            "value_start": "1000",
            "value_end": "5000"
        }
    ]
}

 ```

---

## Example 3: Ignition ON Alert

``` json
{
    "name": "Ignition ON Alert",
    "status": "active",
    "subrule_logic": "AND",
    "subrules": [
        {
            "order": 1,
            "parameter": "ignition_status",
            "operator": "==",
            "value": "ON"
        }
    ]
}

 ```

---

## Example 4: Night Speed Monitoring

``` json
{
    "name": "Night Speed Alert",
    "status": "active",
    "subrule_logic": "AND",
    "time_from": "22:00:00",
    "time_to": "06:00:00",
    "subrules": [
        {
            "order": 1,
            "parameter": "speed",
            "operator": ">",
            "value": "60"
        },
        {
            "order": 2,
            "parameter": "ignition_status",
            "operator": "==",
            "value": "ON"
        }
    ]
}

 ```

---

## Role-Based Behavior

### Super Admin

- Can create global rules.
    
- Rule is created with `state = null`.
    
- Rule applies across all states.
    

### State Admin

- State is automatically assigned from the logged-in user's assigned state.
    
- State cannot be overridden from the request payload.
    
- Rule applies only within that state.
    

---

## Business Rules

- Maximum 4 subrules are allowed per rule.
    
- Subrules are evaluated using the configured `AND` or `OR` logic.
    
- Rule-level time windows are optional.
    
- Subrule-level time windows are optional.
    
- Only rules with status `active` are evaluated.
    
- Matching alerts are stored in:
    
    - AlertsLog
        
    - CustomAlertLog
        
- Duplicate alerts are suppressed for 30 minutes for the same rule-device combination.
    

---

## Error Response

``` json
{
    "success": false,
    "message": "Validation Error",
    "errors": {
        "field_name": [
            "Error message"
        ]
    }
}

 ```








 # List Custom Alert Rules

Returns all custom alert rules visible to the authenticated user.

- Super Admins can view all custom alert rules.
    
- State Admins can view:
    
    - Global rules (`state = null`)
        
    - Rules belonging to their assigned state.
        

---

## Endpoint

``` http
GET /api/custom-alerts/rules/

 ```

---

## Permissions

| Role | Access |
| --- | --- |
| Super Admin | Yes |
| State Admin | Yes |

Authentication is required.

``` http
Authorization: Bearer <access_token>

 ```

---

## Request Headers

| Header | Value |
| --- | --- |
| Authorization | Bearer |

---

## Query Parameters

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| status | string | No | Filter by rule status (`active`, `inactive`) |
| search | string | No | Search by rule name |
| state_id | integer | No | Filter by state ID (Super Admin only) |

---

## Example Request

### Get All Rules

``` http
GET /api/custom-alerts/rules/

 ```

### Filter Active Rules

``` http
GET /api/custom-alerts/rules/?status=active

 ```

### Search Rules

``` http
GET /api/custom-alerts/rules/?search=speed

 ```

### Filter By State (Super Admin)

``` http
GET /api/custom-alerts/rules/?state_id=5

 ```

---

## Success Response

**Status Code:** `200 OK`

``` json
{
    "success": true,
    "message": "Custom alert rules fetched successfully",
    "count": 1,
    "data": [
        {
            "id": 1,
            "name": "High Speed Alert",
            "description": "Fires when speed exceeds 80",
            "status": "active",
            "subrule_logic": "AND",
            "time_from": null,
            "time_to": null,
            "state": null,
            "state_name": null,
            "subrules": [
                {
                    "id": 1,
                    "order": 1,
                    "parameter": "speed",
                    "operator": ">",
                    "value": "80",
                    "value_start": "",
                    "value_end": "",
                    "time_from": null,
                    "time_to": null
                }
            ],
            "log_count": 1,
            "created_by": 1646,
            "created_by_name": "System Admin Test",
            "created_at": "2026-06-11T16:50:58.234256+05:30",
            "updated_at": "2026-06-11T16:50:58.234302+05:30"
        }
    ]
}

 ```

---

## Response Fields

| Field | Type | Description |
| --- | --- | --- |
| id | integer | Rule ID |
| name | string | Rule name |
| description | string | Rule description |
| status | string | Rule status |
| subrule_logic | string | Rule evaluation logic (`AND` / `OR`) |
| time_from | time/null | Rule-level start time |
| time_to | time/null | Rule-level end time |
| state | integer/null | State ID |
| state_name | string/null | State name |
| subrules | array | Configured subrules |
| log_count | integer | Number of times the rule has fired |
| created_by | integer | Creator user ID |
| created_by_name | string | Creator name |
| created_at | datetime | Creation timestamp |
| updated_at | datetime | Last update timestamp |

---

## Subrule Response Fields

| Field | Type | Description |
| --- | --- | --- |
| id | integer | Subrule ID |
| order | integer | Execution order |
| parameter | string | GPS parameter being monitored |
| operator | string | Comparison operator |
| value | string | Comparison value |
| value_start | string | Range start value |
| value_end | string | Range end value |
| time_from | time/null | Subrule start time |
| time_to | time/null | Subrule end time |

---

## Role-Based Visibility

### Super Admin

Can view:

- All global rules
    
- All state-specific rules
    

### State Admin

Can view:

- Global rules (`state = null`)
    
- Rules assigned to their state only
    

---

## Available Filters

### Status Filter

``` http
GET /api/custom-alerts/rules/?status=active

 ```

Possible values:

``` text
active
inactive

 ```

### Search Filter

Searches rule names using case-insensitive partial matching.

``` http
GET /api/custom-alerts/rules/?search=speed

 ```

### State Filter (Super Admin Only)

``` http
GET /api/custom-alerts/rules/?state_id=5

 ```

---

## Error Response

``` json
{
    "success": false,
    "message": "Authentication credentials were not provided.",
    "errors": {}
}

 ```















 # Get Custom Alert Rule Details

Returns detailed information for a specific custom alert rule, including its configured subrules, creator information, scope, and trigger statistics.

---

## Endpoint

``` http
GET /api/custom-alerts/rules/{id}/

 ```

---

## Permissions

| Role | Access |
| --- | --- |
| Super Admin | Yes |
| State Admin | Yes |

Authentication is required.

``` http
Authorization: Bearer <access_token>

 ```

---

## Path Parameters

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| id | integer | Yes | Custom Alert Rule ID |

---

## Request Headers

| Header | Value |
| --- | --- |
| Authorization | Bearer |

---

## Example Request

``` http
GET /api/custom-alerts/rules/1/

 ```

---

## Success Response

**Status Code:** `200 OK`

``` json
{
    "success": true,
    "message": "Custom alert rule fetched successfully",
    "data": {
        "id": 1,
        "name": "High Speed Alert",
        "description": "Fires when speed exceeds 80",
        "status": "active",
        "subrule_logic": "AND",
        "time_from": null,
        "time_to": null,
        "state": null,
        "state_name": null,
        "subrules": [
            {
                "id": 1,
                "order": 1,
                "parameter": "speed",
                "operator": ">",
                "value": "80",
                "value_start": "",
                "value_end": "",
                "time_from": null,
                "time_to": null
            }
        ],
        "log_count": 1,
        "created_by": 1646,
        "created_by_name": "System Admin Test",
        "created_at": "2026-06-11T16:50:58.234256+05:30",
        "updated_at": "2026-06-11T16:50:58.234302+05:30"
    }
}

 ```

---

## Response Fields

| Field | Type | Description |
| --- | --- | --- |
| id | integer | Rule ID |
| name | string | Rule name |
| description | string | Rule description |
| status | string | Rule status (`active`, `inactive`) |
| subrule_logic | string | Rule logic (`AND`, `OR`) |
| time_from | time/null | Rule-level start time |
| time_to | time/null | Rule-level end time |
| state | integer/null | State ID |
| state_name | string/null | State name |
| subrules | array | Configured subrules |
| log_count | integer | Number of times the rule has triggered |
| created_by | integer | Creator user ID |
| created_by_name | string | Creator name |
| created_at | datetime | Creation timestamp |
| updated_at | datetime | Last update timestamp |

---

## Subrule Object

| Field | Type | Description |
| --- | --- | --- |
| id | integer | Subrule ID |
| order | integer | Execution order |
| parameter | string | GPS parameter being monitored |
| operator | string | Comparison operator |
| value | string | Comparison value |
| value_start | string | Range start value |
| value_end | string | Range end value |
| time_from | time/null | Subrule start time |
| time_to | time/null | Subrule end time |

---

## Access Rules

### Super Admin

Can access:

- Global rules
    
- State-specific rules
    

### State Admin

Can access:

- Global rules (`state = null`)
    
- Rules assigned to their own state
    

Cannot access:

- Rules belonging to other states
    

---

## Example Error Response

### Rule Not Found

**Status Code:** `404 Not Found`

``` json
{
    "detail": "Not found."
}

 ```

### Unauthorized

**Status Code:** `401 Unauthorized`

``` json
{
    "success": false,
    "message": "Authentication credentials were not provided.",
    "errors": {}
}

 ```

---

## Notes

- Returns a single custom alert rule.
    
- Includes all associated subrules.
    
- Includes total trigger count via `log_count`.
    
- Includes creator information.
    
- Includes state scope information when applicable.
    
- Rule visibility is automatically restricted based on the logged-in user's role and assigned state.












# List Custom Alert Logs

Returns all fired custom alert logs visible to the authenticated user.

- Super Admins can view all custom alert logs.
    
- State Admins can view logs belonging to their assigned state.
    

Results are paginated and support filtering by rule, vehicle, state, and date range.

---

## Endpoint

``` http
GET /api/custom-alerts/logs/

 ```

---

## Permissions

| Role | Access |
| --- | --- |
| Super Admin | Yes |
| State Admin | Yes |

Authentication is required.

``` http
Authorization: Bearer <access_token>

 ```

---

## Request Headers

| Header | Value |
| --- | --- |
| Authorization | Bearer |

---

## Query Parameters

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| rule_id | integer | No | Filter by custom alert rule ID |
| vehicle_reg_no | string | No | Filter by vehicle registration number |
| from_datetime | datetime | No | Return logs fired on or after this datetime |
| to_datetime | datetime | No | Return logs fired on or before this datetime |
| state_id | integer | No | Filter by state (Super Admin only) |
| page | integer | No | Page number (default: 1) |
| page_size | integer | No | Records per page (default: 20, max: 100) |

---

## Example Requests

### Get All Logs

``` http
GET /api/custom-alerts/logs/

 ```

### Filter By Rule

``` http
GET /api/custom-alerts/logs/?rule_id=1

 ```

### Filter By Vehicle

``` http
GET /api/custom-alerts/logs/?vehicle_reg_no=UP16AB1001

 ```

### Filter By Date Range

``` http
GET /api/custom-alerts/logs/?from_datetime=2026-06-01T00:00:00Z&to_datetime=2026-06-30T23:59:59Z

 ```

### Filter By State (Super Admin)

``` http
GET /api/custom-alerts/logs/?state_id=5

 ```

### Pagination

``` http
GET /api/custom-alerts/logs/?page=2&page_size=50

 ```

---

## Success Response

**Status Code:** `200 OK`

``` json
{
    "success": true,
    "message": "Custom alert logs fetched successfully",
    "pagination": {
        "page": 1,
        "page_size": 20,
        "total_records": 1,
        "total_pages": 1,
        "has_next": false,
        "has_previous": false
    },
    "data": [
        {
            "id": 1,
            "rule": 1,
            "rule_name": "High Speed Alert",
            "device_tag": 1,
            "vehicle_reg_no": "UP16AB1001",
            "state_name": "Uttar Pradesh",
            "latitude": 26.123456,
            "longitude": 91.123456,
            "speed": 90.0,
            "details": "[1] speed > 80",
            "fired_at": "2026-06-11T16:58:26.924482+05:30"
        }
    ]
}

 ```

---

## Pagination Object

| Field | Type | Description |
| --- | --- | --- |
| page | integer | Current page number |
| page_size | integer | Number of records returned |
| total_records | integer | Total matching records |
| total_pages | integer | Total available pages |
| has_next | boolean | Whether next page exists |
| has_previous | boolean | Whether previous page exists |

---

## Log Object Fields

| Field | Type | Description |
| --- | --- | --- |
| id | integer | Log ID |
| rule | integer | Custom alert rule ID |
| rule_name | string | Rule name |
| device_tag | integer | DeviceTag ID |
| vehicle_reg_no | string | Vehicle registration number |
| state_name | string | State name |
| latitude | float | Vehicle latitude when alert fired |
| longitude | float | Vehicle longitude when alert fired |
| speed | float | Vehicle speed when alert fired |
| details | string | Matching rule details |
| fired_at | datetime | Alert trigger timestamp |

---

## Date Filter Format

Use ISO 8601 datetime format.

Examples:

``` text
2026-06-01T00:00:00Z
2026-06-11T15:30:00+05:30

 ```

---

## Role-Based Access

### Super Admin

Can view:

- All custom alert logs
    
- Logs from all states
    
- Can use `state_id` filter
    

### State Admin

Can view:

- Logs from their assigned state
    
- Global logs (`state = null`)
    

Cannot view:

- Logs from other states
    

---

## Business Rules

- Results are ordered by latest alerts first.
    
- Maximum page size is 100.
    
- Logs are generated when a custom alert rule evaluates to true.
    
- Each log contains GPS data captured at the time the alert was triggered.
    
- Alert generation respects the configured cooldown period of the corresponding rule.
    

---

## Error Response

### Invalid Pagination Values

**Status Code:** `400 Bad Request`

``` json
{
    "success": false,
    "message": "page and page_size must be integers",
    "errors": {}
}

 ```

### Unauthorized

**Status Code:** `401 Unauthorized`

``` json
{
    "success": false,
    "message": "Authentication credentials were not provided.",
    "errors": {}
}

 ```




















 # Update Custom Alert Rule

Updates an existing custom alert rule.

This API supports partial updates of rule fields. Any field omitted from the request remains unchanged.

If the `subrules` field is included, all existing subrules are deleted and replaced with the supplied subrules.

---

## Endpoint

``` http
POST /api/custom-alerts/rules/{id}/update/

 ```

---

## Permissions

| Role | Access |
| --- | --- |
| Super Admin | Yes |
| State Admin | Yes |

Authentication is required.

``` http
Authorization: Bearer <access_token>

 ```

---

## Path Parameters

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| id | integer | Yes | Custom Alert Rule ID |

---

## Request Headers

| Header | Value |
| --- | --- |
| Content-Type | application/json |
| Authorization | Bearer |

---

## Request Body

All fields are optional.

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| name | string | No | Rule name |
| description | string | No | Rule description |
| status | string | No | `active` or `inactive` |
| subrule_logic | string | No | `AND` or `OR` |
| time_from | string | No | Rule start time (`HH:MM:SS`) |
| time_to | string | No | Rule end time (`HH:MM:SS`) |
| subrules | array | No | Complete replacement of existing subrules |

---

## Example Request

### Update Description Only

``` json
{
    "description": "Updated description"
}

 ```

---

### Update Status

``` json
{
    "status": "inactive"
}

 ```

---

### Replace All Subrules

``` json
{
    "subrules": [
        {
            "order": 1,
            "parameter": "speed",
            "operator": ">",
            "value": "100"
        },
        {
            "order": 2,
            "parameter": "ignition_status",
            "operator": "==",
            "value": "ON"
        }
    ]
}

 ```

---

### Update Multiple Fields

``` json
{
    "name": "Updated High Speed Alert",
    "description": "Updated alert description",
    "status": "active",
    "subrule_logic": "OR"
}

 ```

---

## Success Response

**Status Code:** `200 OK`

``` json
{
    "success": true,
    "message": "Custom alert rule updated successfully",
    "data": {
        "id": 1,
        "name": "High Speed Alert",
        "description": "Updated description",
        "status": "active",
        "subrule_logic": "AND",
        "time_from": null,
        "time_to": null,
        "state": null,
        "state_name": null,
        "subrules": [
            {
                "id": 1,
                "order": 1,
                "parameter": "speed",
                "operator": ">",
                "value": "80",
                "value_start": "",
                "value_end": "",
                "time_from": null,
                "time_to": null
            }
        ],
        "log_count": 1,
        "created_by": 1646,
        "created_by_name": "System Admin Test",
        "created_at": "2026-06-11T16:50:58.234256+05:30",
        "updated_at": "2026-06-11T17:10:23.271572+05:30"
    }
}

 ```

---

## Subrule Replacement Behavior

When the `subrules` field is supplied:

``` json
{
    "subrules": [
        {
            "order": 1,
            "parameter": "speed",
            "operator": ">",
            "value": "120"
        }
    ]
}

 ```

The API will:

1. Delete all existing subrules.
    
2. Create new subrules from the request payload.
    
3. Return the updated rule.
    

This is a full replacement operation, not a merge.

---

## Validation Rules

### Maximum Subrules

A rule can contain a maximum of 4 subrules.

``` json
{
    "errors": {
        "subrules": [
            "A rule can have a maximum of 4 subrules."
        ]
    }
}

 ```

---

### Unique Subrule Order

Each subrule must have a unique order value.

``` json
{
    "errors": {
        "subrules": [
            "Subrule order values must be unique."
        ]
    }
}

 ```

---

## Access Rules

### Super Admin

Can update:

- Global rules
    
- State-specific rules
    

### State Admin

Can update:

- Global rules
    
- Rules belonging to their assigned state
    

Cannot update:

- Rules belonging to other states
    

State scope cannot be changed through this API.

---

## Error Response

### Rule Not Found

**Status Code:** `404 Not Found`

``` json
{
    "detail": "Not found."
}

 ```

---

### Validation Error

**Status Code:** `400 Bad Request`

``` json
{
    "success": false,
    "message": "Validation Error",
    "errors": {
        "field_name": [
            "Error message"
        ]
    }
}

 ```

---

## Notes

- Partial updates are supported.
    
- Omitted fields remain unchanged.
    
- Including `subrules` triggers complete replacement of all existing subrules.
    
- Maximum 4 subrules are allowed.
    
- Subrule order values must be unique.
    
- State assignment remains unchanged after update.















# Deactivate Custom Alert Rule

Deactivates a custom alert rule by changing its status to `inactive`.

This is a soft-delete operation. The rule remains in the database and can still be viewed for audit and reporting purposes.

Hard deletion is not supported because alert logs reference the rule.

---

## Endpoint

``` http
POST /api/custom-alerts/rules/{id}/delete/

 ```

---

## Permissions

| Role | Access |
| --- | --- |
| Super Admin | Yes |
| State Admin | Yes |

Authentication is required.

``` http
Authorization: Bearer <access_token>

 ```

---

## Path Parameters

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| id | integer | Yes | Custom Alert Rule ID |

---

## Request Headers

| Header | Value |
| --- | --- |
| Authorization | Bearer |

---

## Request Body

No request body is required.

``` json
{}

 ```

---

## Example Request

``` http
POST /api/custom-alerts/rules/1/delete/

 ```

---

## Success Response

**Status Code:** `200 OK`

``` json
{
    "success": true,
    "message": "Custom alert rule deactivated successfully",
    "data": {
        "id": 1,
        "status": "inactive"
    }
}

 ```

---

## Response Fields

| Field | Type | Description |
| --- | --- | --- |
| id | integer | Rule ID |
| status | string | Updated rule status |

---

## Soft Delete Behavior

When this API is called:

1. The rule is not removed from the database.
    
2. Rule status is changed to `inactive`.
    
3. Existing alert logs remain unchanged.
    
4. The rule is excluded from alert evaluation.
    
5. The rule can still be viewed through detail and list APIs.
    

---

## Rule Status Values

| Value | Description |
| --- | --- |
| active | Rule is evaluated against incoming GPS packets |
| inactive | Rule is ignored during evaluation |

---

## Access Rules

### Super Admin

Can deactivate:

- Global rules
    
- State-specific rules
    

### State Admin

Can deactivate:

- Global rules
    
- Rules belonging to their assigned state
    

Cannot deactivate:

- Rules belonging to other states
    

---

## Impact on Alert Processing

After deactivation:

- The rule will no longer be evaluated against new GPS packets.
    
- No new alerts will be generated from the rule.
    
- Existing records in:
    
    - `AlertsLog`
        
    - `CustomAlertLog`
        

```
remain unchanged.

 ```

---

## Error Response

### Rule Not Found

**Status Code:** `404 Not Found`

``` json
{
    "detail": "Not found."
}

 ```

---

### Unauthorized

**Status Code:** `401 Unauthorized`

``` json
{
    "success": false,
    "message": "Authentication credentials were not provided.",
    "errors": {}
}

 ```

---

## Notes

- This endpoint performs a soft delete.
    
- Hard delete is intentionally not supported.
    
- Historical alert logs remain intact.
    
- Deactivated rules can still be retrieved through list and detail APIs.
    
- Deactivated rules are excluded from future alert evaluations.