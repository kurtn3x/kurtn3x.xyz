# Documentation on frontend

## API Calls

- Any Page that consists of multiple sub-components has to have a store assigned to it
  - The Store will manage all calls to the API
  - The store will manage data across multiple components
  - The Store will manage the overall loading/error state of the page
- Otherwise a composable is used (exported API logic)

## Loading & Error States

- There are 2 loading & error states:
  - **Store loading/error state**
    - defined in the store/composable assigned to the page as `loading` and `error`
    - the page depends on this overall state and must handle errors correctly
    - The initial data or an initial variable must be initialized before the store can work
    - An erroneous state will cause the page to redirect to an error page
    - A loading state will cause the entire page to show a loading icon
  - **Local loading(/error) state**
    - defined on the component as `localLoading`
    - nothing depends on the state besides the component
    - Errors are not directly handled -> an erroneous state results in no data to be shown
    - The error state is shown to the user via q.notify()
    - No errors handling is done in the component
