## API and Data Contract Documentation

This repository currently contains a single JSON data artifact: `Lmc.json`. There are no source code files or exported functions/components. The following documentation describes the structure and usage of this JSON payload so it can be consumed by applications or services.

### Artifact: `Lmc.json`
- **Type**: JSON object
- **Purpose**: Represents configuration and metadata for a specific mall activity/event: "Jay Chou Carnival Official Collection"
- **Top-level fields**:
  - **m** (number): Version or mode indicator. Example: `1`.
  - **d** (object): Primary data payload containing event/activity fields.

### Schema for `d`
- **ID** (number): Unique activity identifier. Example: `231028`.
- **CouponSysType** (number): Coupon system type code. Example: `1`.
- **MallID** (number): Identifier for the mall. Example: `11147`.
- **Name** (string): Activity name. Example: `Jay Chou Carnival Official Collection`.
- **IsIncludeVipCard** (boolean): Whether VIP card is included. Example: `false`.
- **SubTitle** (string): Optional subtitle. May be empty string.
- **Photo** (string): Relative path or key to the main photo. Example: `sp_mall/88/3c/w0/31-7da2-4625-aba2-cd6531e8f575.png`.
- **Status** (number): Activity status code. Example: `2`.
- **Article** (string): Description or announcement. Example (Chinese): `PHANTACI上海限定粉色隐藏款限量贩售10月11日场次`.
- **IsAudit** (boolean): Whether activity is audited. Example: `false`.
- **IsBindMobile** (boolean): Whether mobile binding is required. Example: `false`.
- **IsDeductionBonus** (boolean): Whether points can be deducted. Example: `false`.
- **DeductionBonus** (number): Deductible bonus amount. Example: `0.0`.
- **IsMultiSession** (boolean): Whether multiple sessions are supported. Example: `true`.
- **SessionType** (number): Session type code. Example: `2`.
- **IsNeedFee** (boolean): Whether payment is required. Example: `false`.
- **IsHideFeeTip** (boolean): Whether to hide fee tips. Example: `false`.
- **PayAmount** (number): Payment amount if applicable. Example: `0.0`.
- **IsWriteRI** (boolean): Whether real-name info is written. Example: `false`.
- **IsNeedCardType** (boolean): Whether card type selection is required. Example: `true`.
- **IsAllCardType** (boolean): Whether all card types are allowed. Example: `true`.
- **MallCardTypeIDList** (number[]): Allowed mall card type IDs. Example: `[3120,3121,4970,4971]`.
- **MallCardTypeName** (string): Comma-separated names of card types (trailing comma may be present). Example: `蓝卡,红卡,粉卡,橙卡,`.
- **TotalCountLimit** (number): Global quota. Example: `600`.
- **TotalSurplusCount** (number): Remaining global quota. Example: `600`.
- **IsFulled** (boolean): Whether the activity is fully booked. Example: `false`.
- **IsSignLimit** (boolean): Whether per-user sign-up limit is enforced. Example: `true`.
- **SignLimitCount** (number): Per-user sign-up limit. Example: `1`.
- **IsSignUp** (boolean): Whether the current user has signed up. Example: `false`.
- **IsPayMent** (boolean): Whether payment has been made by the user. Example: `false`.
- **CouponID** (number): Related coupon ID if any. Example: `0`.
- **IsMallCard** (boolean): Whether mall card is required. Example: `true`.
- **Bonus** (number): Bonus points related field. Example: `0.0`.
- **SignCount** (number): Number of sign-ups by the current user. Example: `0`.
- **IsNeedSignUp** (boolean): Whether sign-up is required. Example: `true`.
- **Pact** (string): Terms/notes for participation (Chinese). Example: multiline instructions.
- **SignStartTime** (string, datetime): Sign-up start time. Example: `2025/10/10 23:00:00`.
- **SignEndTime** (string, datetime): Sign-up end time. Example: `2025/10/11 09:00:00`.
- **CanWeixinShare** (boolean): Shareable via WeChat Mini Program. Example: `false`.
- **SharePhoto** (string): Share image path. May be empty.
- **StartTime** (string, datetime): Activity start time. Example: `2025/10/11 10:00:00`.
- **EndTime** (string, datetime): Activity end time. Example: `2025/10/11 18:00:00`.
- **ShowStartTime** (string, datetime): Display start time. Example: `2025/10/10 17:30:00`.
- **ShowEndTime** (string, datetime): Display end time. Example: `2025/10/11 23:59:59`.
- **MemberLimit** (object): Membership-related limits.
  - **IsGetLimit** (boolean): Whether acquisition limit applies. Example: `false`.
  - **LimitType** (number): Type code. Example: `0`.
- **IsUserNotSign** (boolean): Whether the current user is not signed. Example: `true`.
- **IsSessionSignFull** (boolean): Whether all sessions are full. Example: `false`.
- **IsSessionTimeEnd** (boolean): Whether the session time has ended. Example: `false`.
- **SignedSessionCount** (number): Count of sessions signed by the user. Example: `0`.
- **IsUserSignLimit** (boolean): Whether user hit sign-up limit. Example: `false`.
- **IsHideActivityQuota** (boolean): Whether to hide quota display. Example: `false`.
- **AnotherStatus** (number): Additional status code. Example: `2`.
- **SessionID** (number): Selected session identifier. Example: `0`.
- **OrderID** (number): Related order ID if any. Example: `0`.
- **IsSatisfyDiscount** (boolean): Whether discount criteria satisfied. Example: `true`.
- **IsShowSignRemindBtn** (boolean): Whether to show sign reminder button. Example: `false`.
- **IsShowActivityRemindBtn** (boolean): Whether to show activity reminder button. Example: `false`.
- **IsSupportAppletShare** (boolean): Mini Program sharing support. Example: `true`.
- **appletShareImg** (string): Mini Program share image path.
- **appletShareTitle** (string): Mini Program share title. May be empty.
- **appletShareContent** (string): Mini Program share description. May be empty.
- **IsShowAntiBrushing** (boolean): Anti-brushing indicator. Example: `false`.
- **VideoUrl** (string): Promotional video URL. May be empty.
- **ActLabels** (array): Activity labels. Example: `[]`.
- **CategoryID** (number): Category ID. Example: `9411`.
- **CategoryName** (string): Category name. Example: `美罗城会员专享活动`.
- **SubCategoryID** (number): Subcategory ID. Example: `0`.

### Usage
- **Typical consumer**: Frontend app or backend service that needs to display activity details, enforce sign-up rules, and manage quotas for a mall event.
- **Loading example (JavaScript/TypeScript)**:
```ts
import fs from 'node:fs/promises';

async function loadActivity() {
  const text = await fs.readFile('Lmc.json', 'utf-8');
  const { m, d } = JSON.parse(text);
  if (m !== 1) throw new Error('Unsupported version');
  return d; // strongly-type this in TS for safety
}
```

- **Validation tip**: Consider using JSON Schema for validation.

### Example JSON Schema (draft)
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "MallActivity",
  "type": "object",
  "required": ["m", "d"],
  "properties": {
    "m": { "type": "number", "const": 1 },
    "d": {
      "type": "object",
      "required": ["ID", "MallID", "Name", "Status", "StartTime", "EndTime"],
      "properties": {
        "ID": { "type": "number" },
        "CouponSysType": { "type": "number" },
        "MallID": { "type": "number" },
        "Name": { "type": "string" },
        "IsIncludeVipCard": { "type": "boolean" },
        "SubTitle": { "type": "string" },
        "Photo": { "type": "string" },
        "Status": { "type": "number" },
        "Article": { "type": "string" },
        "IsAudit": { "type": "boolean" },
        "IsBindMobile": { "type": "boolean" },
        "IsDeductionBonus": { "type": "boolean" },
        "DeductionBonus": { "type": "number" },
        "IsMultiSession": { "type": "boolean" },
        "SessionType": { "type": "number" },
        "IsNeedFee": { "type": "boolean" },
        "IsHideFeeTip": { "type": "boolean" },
        "PayAmount": { "type": "number" },
        "IsWriteRI": { "type": "boolean" },
        "IsNeedCardType": { "type": "boolean" },
        "IsAllCardType": { "type": "boolean" },
        "MallCardTypeIDList": { "type": "array", "items": { "type": "number" } },
        "MallCardTypeName": { "type": "string" },
        "TotalCountLimit": { "type": "number" },
        "TotalSurplusCount": { "type": "number" },
        "IsFulled": { "type": "boolean" },
        "IsSignLimit": { "type": "boolean" },
        "SignLimitCount": { "type": "number" },
        "IsSignUp": { "type": "boolean" },
        "IsPayMent": { "type": "boolean" },
        "CouponID": { "type": "number" },
        "IsMallCard": { "type": "boolean" },
        "Bonus": { "type": "number" },
        "SignCount": { "type": "number" },
        "IsNeedSignUp": { "type": "boolean" },
        "Pact": { "type": "string" },
        "SignStartTime": { "type": "string" },
        "SignEndTime": { "type": "string" },
        "CanWeixinShare": { "type": "boolean" },
        "SharePhoto": { "type": "string" },
        "StartTime": { "type": "string" },
        "EndTime": { "type": "string" },
        "ShowStartTime": { "type": "string" },
        "ShowEndTime": { "type": "string" },
        "MemberLimit": {
          "type": "object",
          "properties": {
            "IsGetLimit": { "type": "boolean" },
            "LimitType": { "type": "number" }
          }
        },
        "IsUserNotSign": { "type": "boolean" },
        "IsSessionSignFull": { "type": "boolean" },
        "IsSessionTimeEnd": { "type": "boolean" },
        "SignedSessionCount": { "type": "number" },
        "IsUserSignLimit": { "type": "boolean" },
        "IsHideActivityQuota": { "type": "boolean" },
        "AnotherStatus": { "type": "number" },
        "SessionID": { "type": "number" },
        "OrderID": { "type": "number" },
        "IsSatisfyDiscount": { "type": "boolean" },
        "IsShowSignRemindBtn": { "type": "boolean" },
        "IsShowActivityRemindBtn": { "type": "boolean" },
        "IsSupportAppletShare": { "type": "boolean" },
        "appletShareImg": { "type": "string" },
        "appletShareTitle": { "type": "string" },
        "appletShareContent": { "type": "string" },
        "IsShowAntiBrushing": { "type": "boolean" },
        "VideoUrl": { "type": "string" },
        "ActLabels": { "type": "array" },
        "CategoryID": { "type": "number" },
        "CategoryName": { "type": "string" },
        "SubCategoryID": { "type": "number" }
      }
    }
  }
}
```

### Consumption Notes
- Normalize date strings to UTC timestamps for comparisons.
- Treat empty strings in optional fields as "unset".
- Arrays like `MallCardTypeIDList` may be empty in other datasets.

### Example Consumer Logic (pseudocode)
```ts
function canUserSignUp(data, user) {
  if (data.IsFulled) return false;
  if (data.IsSessionTimeEnd) return false;
  if (!data.IsNeedSignUp) return false;
  if (data.IsUserSignLimit) return false;
  if (data.IsNeedCardType && !user.hasAnyCard(data.MallCardTypeIDList)) return false;
  return true;
}
```
