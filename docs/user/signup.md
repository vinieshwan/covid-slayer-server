# Signup Endpoint

User signup endpoint

## Resource Information

| -------- | ------------------------ |
| Endpoint | `/v1/signup` |
| Method | `POST` |

## Request Body

| Property | Type   | Description   | Constraints                                 |
| -------- | ------ | ------------- | ------------------------------------------- |
| email    | String | User email    | Format: `email`, Max-length: `255`          |
| password | String | User password | Min-length: `6`, Max-length: `100`          |
| name     | String | User name     | Min-length: `6`, Max-length: `100`          |
| avatar   | String | User avatar   | enum: ['witch', 'archer', 'boxer', 'ninja'] |

## Example Response

Below is given a sample response

```javascript
{
	data: {
		ok: true;
	}
}
```
