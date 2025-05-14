import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import {
    collection,
    addDoc,
    getDocs,
    updateDoc,
    deleteDoc,
    doc,
} from "firebase/firestore";
import {
    TextField,
    Button,
    List,
    ListItem,
    ListItemText,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
} from "@mui/material";
import { format } from "date-fns";

function Todo() {
    const [todos, setTodos] = useState([]);
    const [title, setTitle] = useState("");
    const [details, setDetails] = useState("");
    const [dueDate, setDueDate] = useState("");
    const [editDialog, setEditDialog] = useState(false);
    const [editTodo, setEditTodo] = useState(null);

    useEffect(() => {
        fetchTodos();
    }, []);

    const fetchTodos = async () => {
        const querySnapshot = await getDocs(collection(db, "todos"));
        const todoList = [];
        querySnapshot.forEach((doc) => {
            todoList.push({ id: doc.id, ...doc.data() });
        });
        setTodos(todoList);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await addDoc(collection(db, "todos"), {
                title,
                details,
                dueDate,
                createdAt: new Date().toISOString(),
            });
            setTitle("");
            setDetails("");
            setDueDate("");
            fetchTodos();
        } catch (error) {
            console.error("Error adding todo:", error);
        }
    };

    const handleEdit = (todo) => {
        setEditTodo(todo);
        setEditDialog(true);
    };

    const handleUpdate = async () => {
        try {
            const todoRef = doc(db, "todos", editTodo.id);
            await updateDoc(todoRef, {
                title: editTodo.title,
                details: editTodo.details,
                dueDate: editTodo.dueDate,
            });
            setEditDialog(false);
            fetchTodos();
        } catch (error) {
            console.error("Error updating todo:", error);
        }
    };

    const handleDelete = async (id) => {
        try {
            await deleteDoc(doc(db, "todos", id));
            fetchTodos();
        } catch (error) {
            console.error("Error deleting todo:", error);
        }
    };

    return (
        <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
            <h1>Todo List</h1>

            <form onSubmit={handleSubmit} style={{ marginBottom: "20px" }}>
                <TextField
                    label="Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    fullWidth
                    margin="normal"
                    required
                />
                <TextField
                    label="Details"
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    fullWidth
                    margin="normal"
                    multiline
                    rows={3}
                    required
                />
                <TextField
                    type="datetime-local"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    fullWidth
                    margin="normal"
                    required
                />
                <Button type="submit" variant="contained" color="primary">
                    Add Todo
                </Button>
            </form>

            <List>
                {todos.map((todo) => (
                    <ListItem key={todo.id} divider>
                        <ListItemText
                            primary={todo.title}
                            secondary={
                                <>
                                    <p>{todo.details}</p>
                                    <p>
                                        Due:{" "}
                                        {format(new Date(todo.dueDate), "PPpp")}
                                    </p>
                                </>
                            }
                        />
                        <Button onClick={() => handleEdit(todo)}>Edit</Button>
                        <Button
                            onClick={() => handleDelete(todo.id)}
                            color="error"
                        >
                            Delete
                        </Button>
                    </ListItem>
                ))}
            </List>

            <Dialog open={editDialog} onClose={() => setEditDialog(false)}>
                <DialogTitle>Edit Todo</DialogTitle>
                <DialogContent>
                    <TextField
                        label="Title"
                        value={editTodo?.title || ""}
                        onChange={(e) =>
                            setEditTodo({ ...editTodo, title: e.target.value })
                        }
                        fullWidth
                        margin="normal"
                    />
                    <TextField
                        label="Details"
                        value={editTodo?.details || ""}
                        onChange={(e) =>
                            setEditTodo({
                                ...editTodo,
                                details: e.target.value,
                            })
                        }
                        fullWidth
                        margin="normal"
                        multiline
                        rows={3}
                    />
                    <TextField
                        type="datetime-local"
                        value={editTodo?.dueDate || ""}
                        onChange={(e) =>
                            setEditTodo({
                                ...editTodo,
                                dueDate: e.target.value,
                            })
                        }
                        fullWidth
                        margin="normal"
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEditDialog(false)}>Cancel</Button>
                    <Button onClick={handleUpdate} color="primary">
                        Update
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}

export default Todo;
