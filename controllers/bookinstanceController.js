const BookInstance = require("../models/bookinstance");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const Book = require("../models/book");

// Display list of all BookInstances.
exports.bookinstance_list = asyncHandler(async (req, res, next) => {
  const allBookInstances = await BookInstance.find().populate("book").exec();

  res.render("layout", {
    title: "Book Instance List",
    content: "bookinstance_list",
    bookinstance_list: allBookInstances,
  });
});

// Display detail page for a specific BookInstance.
exports.bookinstance_detail = asyncHandler(async (req, res, next) => {
  const bookInstance = await BookInstance.findById(req.params.id)
    .populate("book")
    .exec();

  if (bookInstance === null) {
    // No results.
    const err = new Error("Book copy not found");
    err.status = 404;
    return next(err);
  }

  res.render("layout", {
    title: "Book:",
    content: "bookinstance_detail",
    bookinstance: bookInstance,
  });
});

// Display BookInstance create form on GET.
exports.bookinstance_create_get = asyncHandler(async (req, res, next) => {
  const allBooks = await Book.find({}, "title").exec();

  res.render("layout", {
    title: "Create BookInstance",
    content: "bookinstance_form",
    bookinstance: null,
    errors: null,
    selected_book: null,
    book_list: allBooks,
  });
});

// Handle BookInstance create on POST.
exports.bookinstance_create_post = [
  // Validate and sanitize fields.
  body("book", "Book must be specified").trim().isLength({ min: 1 }).escape(),
  body("imprint", "Imprint must be specified")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("status").escape(),
  body("due_back", "Invalid date")
    .optional({ values: "falsy" })
    .isISO8601()
    .toDate(),

  // Process request after validation and sanitization.
  asyncHandler(async (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a BookInstance object with escaped and trimmed data.
    const bookInstance = new BookInstance({
      book: req.body.book,
      imprint: req.body.imprint,
      status: req.body.status,
      due_back: req.body.due_back,
    });

    if (!errors.isEmpty()) {
      // There are errors.
      // Render form again with sanitized values and error messages.
      const allBooks = await Book.find({}, "title").exec();

      res.render("layout", {
        title: "Create BookInstance",
        content: "bookinstance_form",
        book_list: allBooks,
        selected_book: bookInstance.book._id,
        errors: errors.array(),
        bookinstance: bookInstance,
      });
      return;
    } else {
      // Data from form is valid
      await bookInstance.save();
      res.redirect(bookInstance.url);
    }
  }),
];

// Display BookInstance delete form on GET.
exports.bookinstance_delete_get = asyncHandler(async (req, res, next) => {
  // Get details of book instance
  const bookinstance = await BookInstance.findById(req.params.id)
    .populate("book")
    .exec();

  if (bookinstance === null) {
    // No results.
    res.redirect("/catalog/bookinstances");
  }

  res.render("layout", {
    title: "Delete Book Copy",
    content: "bookinstance_delete",
    bookinstance: bookinstance,
  });
});

// Handle BookInstance delete on POST.
exports.bookinstance_delete_post = asyncHandler(async (req, res, next) => {
  // Get details of book instance
  const bookinstance = await BookInstance.findById(req.params.id)
    .populate("book")
    .exec();
  if (bookinstance != null) {
    await BookInstance.findByIdAndRemove(req.body.bookinstanceid);
  }
  res.redirect("/catalog/bookinstances");
});

// Display BookInstance update form on GET.
exports.bookinstance_update_get = asyncHandler(async (req, res, next) => {
  // Get bookinstance for form.
  const bookinstance = await BookInstance.findById(req.params.id);
  const allBooks = await Book.find({}, "title").exec();
  const selected_book = await Book.findById(bookinstance.book);

  if (bookinstance === null) {
    // No results.
    const err = new Error("Book copy not found");
    err.status = 404;
    return next(err);
  }

  console.log(bookinstance.book);
  res.render("layout", {
    title: "Update Book Copy",
    content: "bookinstance_form",
    bookinstance: bookinstance,
    errors: null,
    selected_book: selected_book,
    book_list: allBooks,
  });
});

// Handle bookinstance update on POST.
exports.bookinstance_update_post = [
  // Validate and sanitize fields.
  body("book", "Book must be specified").trim().isLength({ min: 1 }).escape(),
  body("imprint", "Imprint must be specified")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("status").escape(),
  body("due_back", "Invalid date")
    .optional({ values: "falsy" })
    .isISO8601()
    .toDate(),

  // Process request after validation and sanitization.
  asyncHandler(async (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a BookInstance object with escaped and trimmed data.
    const bookInstance = new BookInstance({
      book: req.body.book,
      imprint: req.body.imprint,
      status: req.body.status,
      due_back: req.body.due_back,
      _id: req.params.id, // This is required, or a new ID will be assigned!
    });

    if (!errors.isEmpty()) {
      // There are errors.
      // Render form again with sanitized values and error messages.
      const allBooks = await Book.find({}, "title").exec();

      res.render("layout", {
        title: "Create BookInstance",
        content: "bookinstance_form",
        book_list: allBooks,
        selected_book: bookInstance.book._id,
        errors: errors.array(),
        bookinstance: bookInstance,
      });
      return;
    } else {
      const updatedBookInstance = await BookInstance.findByIdAndUpdate(
        req.params.id,
        bookInstance,
        {}
      );
      // Redirect to book detail page.
      res.redirect(updatedBookInstance.url);
    }
  }),
];
