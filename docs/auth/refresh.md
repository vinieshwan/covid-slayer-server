# Refresh Endpoint

API account access endpoint

## Resource Information

| -------- | ------------------------ |
| Endpoint | `/v1/refresh` |
| Method | `GET` |

## Request Body

No body or params needed

## Example Response

Below is given a sample response

```javascript
{
    data: {
        ok: true,
        session: {
            expiry: 654321789,
            name: 'John Doe',
            avatar: 'witch'
        }
	}
}
```
