"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Gender = exports.UserType = exports.CategoryType = exports.BookmarkTarget = exports.ArticleStatus = void 0;
var ArticleStatus;
(function (ArticleStatus) {
    ArticleStatus["DRAFT"] = "Draft";
    ArticleStatus["PRIVATE"] = "Private";
    ArticleStatus["PUBLISHED"] = "Published";
})(ArticleStatus || (exports.ArticleStatus = ArticleStatus = {}));
var BookmarkTarget;
(function (BookmarkTarget) {
    BookmarkTarget["PLACE"] = "Place";
    BookmarkTarget["EVENT"] = "Event";
})(BookmarkTarget || (exports.BookmarkTarget = BookmarkTarget = {}));
var CategoryType;
(function (CategoryType) {
    CategoryType["PLACE"] = "Place";
    CategoryType["EVENT"] = "Event";
})(CategoryType || (exports.CategoryType = CategoryType = {}));
var UserType;
(function (UserType) {
    UserType["ADMINISTRATOR"] = "Administrator";
    UserType["VISITOR"] = "Visitor";
    UserType["RESIDENT"] = "Resident";
})(UserType || (exports.UserType = UserType = {}));
var Gender;
(function (Gender) {
    Gender["MALE"] = "Male";
    Gender["FEMALE"] = "Female";
    Gender["OTHER"] = "Other";
})(Gender || (exports.Gender = Gender = {}));
//# sourceMappingURL=index.js.map