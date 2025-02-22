import { withZod } from "@remix-validated-form/with-zod";
import { nanoid } from "nanoid";
import { ActionFunction, json, useActionData } from "remix";
import {
  FieldArray,
  ValidatedForm,
  validationError,
} from "remix-validated-form";
import { z } from "zod";
import { zfd } from "zod-form-data";
import { Input } from "~/components/Input";
import { SubmitButton } from "~/components/SubmitButton";

const validator = withZod(
  z.object({
    todos: z.array(
      z.object({
        id: z.string(),
        title: zfd.text(),
        notes: zfd.text().optional(),
      })
    ),
  })
);

export const action: ActionFunction = async ({ request }) => {
  const result = await validator.validate(await request.formData());
  if (result.error) return validationError(result.error);
  return json({ message: "Submitted!", todos: result.data.todos });
};

export default function FrontendValidation() {
  const data = useActionData();
  return (
    <ValidatedForm validator={validator} method="post">
      {data && (
        <>
          <h3>{data.message}</h3>
          <ul>
            {data.todos.map((todo: any, index: number) => (
              <li key={index} data-testid="submitted-todo">
                {todo.title}: {todo.notes}
              </li>
            ))}
          </ul>
        </>
      )}
      <FieldArray name="todos">
        {(items, { push, remove }) => (
          <>
            {items.map((item, index) => (
              <div key={item.id} data-testid={`todo-${index}`}>
                <input
                  type="hidden"
                  name={`todos[${index}].id`}
                  value={item.id}
                  data-testid="todo-id"
                />
                <Input name={`todos[${index}].title`} label="Title" />
                <Input name={`todos[${index}].notes`} label="Notes" />
                <button
                  onClick={() => {
                    remove(index);
                  }}
                >
                  Delete todo
                </button>
              </div>
            ))}
            <button type="button" onClick={() => push({ id: nanoid() })}>
              Add todo
            </button>
          </>
        )}
      </FieldArray>
      <SubmitButton />
    </ValidatedForm>
  );
}
