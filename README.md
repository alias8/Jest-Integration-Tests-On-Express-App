Based on this project https://github.com/alias8/Restaurant-Reviews.
Uses:
- ExpressJS (no rendering)
- Typescript
- Jest for integration tests

This is much easier to manage since we don't need webpack. Also using integration
tests instead of unit tests is slower, but I think requires less maintenance
setting up and mocking unit tests. Just use real databases and real data.
